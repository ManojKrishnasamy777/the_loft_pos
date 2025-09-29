import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import * as Razorpay from 'razorpay';
import * as crypto from 'crypto';
import { Payment, PaymentStatus } from '../../entities/payment.entity';
import { Order, OrderStatus } from '../../entities/order.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';

@Injectable()
export class PaymentsService {
  private razorpay: Razorpay;

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private configService: ConfigService,
  ) {
    this.razorpay = new Razorpay({
      key_id: this.configService.get<string>('RAZORPAY_KEY_ID'),
      key_secret: this.configService.get<string>('RAZORPAY_KEY_SECRET'),
    });
  }

  async createRazorpayOrder(orderId: string): Promise<any> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const razorpayOrder = await this.razorpay.orders.create({
      amount: Math.round(order.total * 100), // Amount in paise
      currency: 'INR',
      receipt: order.orderNumber,
      notes: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
    });

    return razorpayOrder;
  }

  async createPayment(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const order = await this.orderRepository.findOne({
      where: { id: createPaymentDto.orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const payment = this.paymentRepository.create({
      ...createPaymentDto,
      status: PaymentStatus.PENDING,
    });

    return this.paymentRepository.save(payment);
  }

  async verifyPayment(verifyPaymentDto: VerifyPaymentDto): Promise<Payment> {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = verifyPaymentDto;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', this.configService.get<string>('RAZORPAY_KEY_SECRET'))
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      throw new BadRequestException('Invalid payment signature');
    }

    // Find payment by gateway order ID
    const payment = await this.paymentRepository.findOne({
      where: { gatewayOrderId: razorpay_order_id },
      relations: ['order'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Update payment status
    await this.paymentRepository.update(payment.id, {
      status: PaymentStatus.COMPLETED,
      gatewayPaymentId: razorpay_payment_id,
      gatewaySignature: razorpay_signature,
    });

    // Update order status
    await this.orderRepository.update(payment.orderId, {
      status: OrderStatus.COMPLETED,
    });

    return this.paymentRepository.findOne({
      where: { id: payment.id },
      relations: ['order'],
    });
  }

  async refundPayment(paymentId: string, amount?: number): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['order'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Payment is not completed');
    }

    const refundAmount = amount || payment.amount;

    try {
      const refund = await this.razorpay.payments.refund(payment.gatewayPaymentId, {
        amount: Math.round(refundAmount * 100), // Amount in paise
      });

      // Update payment status
      await this.paymentRepository.update(paymentId, {
        status: PaymentStatus.REFUNDED,
        gatewayResponse: refund,
      });

      // Update order status
      await this.orderRepository.update(payment.orderId, {
        status: OrderStatus.REFUNDED,
      });

      return this.paymentRepository.findOne({
        where: { id: paymentId },
        relations: ['order'],
      });
    } catch (error) {
      throw new BadRequestException('Refund failed: ' + error.message);
    }
  }

  async findAll(): Promise<Payment[]> {
    return this.paymentRepository.find({
      relations: ['order'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['order'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async getPaymentStats(dateFrom?: Date, dateTo?: Date) {
    const queryBuilder = this.paymentRepository.createQueryBuilder('payment');

    if (dateFrom && dateTo) {
      queryBuilder.where('payment.createdAt BETWEEN :dateFrom AND :dateTo', {
        dateFrom,
        dateTo,
      });
    }

    const [totalPayments, completedPayments, totalAmount] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder.clone().andWhere('payment.status = :status', { status: PaymentStatus.COMPLETED }).getCount(),
      queryBuilder.clone().andWhere('payment.status = :status', { status: PaymentStatus.COMPLETED })
        .select('SUM(payment.amount)', 'total').getRawOne(),
    ]);

    return {
      totalPayments,
      completedPayments,
      failedPayments: totalPayments - completedPayments,
      totalAmount: parseFloat(totalAmount?.total || '0'),
    };
  }
}