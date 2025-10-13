import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import { Order, OrderStatus } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { MenuItem } from '../../entities/menu-item.entity';
import { Customer } from '../../entities/customer.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderFilterDto } from './dto/order-filter.dto';
import { EmailService } from '../email/email.service';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    private emailService: EmailService,
    private settingsService: SettingsService,
  ) { }

  async findAll(filterDto?: OrderFilterDto): Promise<{ orders: Order[]; total: number }> {
    const queryBuilder = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.menuItem', 'menuItem')
      .leftJoinAndSelect('order.createdBy', 'createdBy')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.screen', 'screen')
      .leftJoinAndSelect('order.payments', 'payments');

    if (filterDto?.status) {
      queryBuilder.andWhere('order.status = :status', { status: filterDto.status });
    }
    if (filterDto?.paymentMethod) {
      queryBuilder.andWhere('order.paymentMethod = :paymentMethod', {
        paymentMethod: filterDto.paymentMethod
      });
    }
    if (filterDto?.dateFrom && filterDto?.dateTo) {
      queryBuilder.andWhere('order.createdAt BETWEEN :dateFrom AND :dateTo', {
        dateFrom: filterDto.dateFrom,
        dateTo: filterDto.dateTo,
      });
    }
    if (filterDto?.customerEmail) {
      queryBuilder.andWhere('order.customerEmail LIKE :email', {
        email: `%${filterDto.customerEmail}%`
      });
    }
    if (filterDto?.orderNumber) {
      queryBuilder.andWhere('order.orderNumber LIKE :orderNumber', {
        orderNumber: `%${filterDto.orderNumber}%`
      });
    }

    const page = filterDto?.page || 1;
    const limit = filterDto?.limit || 20;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy('order.createdAt', 'DESC');

    const [orders, total] = await queryBuilder.getManyAndCount();
    return { orders, total };
  }

  async findById(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'items.menuItem', 'createdBy', 'customer', 'screen', 'payments'],
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async create(createOrderDto: CreateOrderDto, userId: string): Promise<Order> {
    const orderNumber = await this.generateOrderNumber();

    const globalTaxRateStr = await this.settingsService.getValue('tax_rate', '0.18');
    const globalTaxRate = parseFloat(globalTaxRateStr);

    let subtotal = 0;
    const orderItems: Partial<OrderItem>[] = [];

    for (const item of createOrderDto.items) {
      const menuItem = await this.menuItemRepository.findOne({
        where: { id: item.menuItemId, isActive: true },
      });
      if (!menuItem) throw new BadRequestException(`Menu item ${item.menuItemId} not found or inactive`);

      const itemSubtotal = menuItem.price * item.quantity;
      const itemTaxAmount = itemSubtotal * globalTaxRate;
      const itemTotal = itemSubtotal + itemTaxAmount;

      orderItems.push({
        menuItemId: menuItem.id,
        quantity: item.quantity,
        price: menuItem.price,
        taxAmount: itemTaxAmount,
        subtotal: itemSubtotal,
        total: itemTotal,
      });

      subtotal += itemSubtotal;
    }

    const taxAmount = subtotal * globalTaxRate;
    const total = subtotal + taxAmount;

    let customerEmail = '';
    let customerName = '';
    let customerPhone = '';

    if (createOrderDto.customerId) {
      // ✅ fetch customer from DB
      const customer = await this.customerRepository.findOne({ where: { id: createOrderDto.customerId } });
      if (!customer) throw new BadRequestException(`Customer ${createOrderDto.customerId} not found`);
      customerEmail = customer.email;
      customerName = customer.name;
      customerPhone = customer.phone;
    } else {
      // ✅ take from frontend if no customerId
      customerEmail = createOrderDto.customerEmail;
      customerName = createOrderDto.customerName;
      customerPhone = createOrderDto.customerPhone;
    }

    const order = this.orderRepository.create({
      orderNumber,
      subtotal,
      taxAmount,
      total,
      customerEmail,
      customerName,
      customerPhone,
      customerId: createOrderDto.customerId || null,
      screenId: createOrderDto.screenId,
      paymentMethod: createOrderDto.paymentMethod,
      status: OrderStatus.PENDING,
      createdById: userId,
      metadata: createOrderDto.metadata,
    });

    const savedOrder = await this.orderRepository.save(order);

    for (const item of orderItems) {
      await this.orderItemRepository.save({
        ...item,
        orderId: savedOrder.id,
      });
    }


    // ✅ update customer stats only if registered
    if (createOrderDto.customerId) {
      await this.customerRepository.increment({ id: createOrderDto.customerId }, 'orderCount', 1);
      await this.customerRepository.increment({ id: createOrderDto.customerId }, 'totalSpent', total);
    }

    const finalOrder = await this.findById(savedOrder.id);
    if (finalOrder.customerEmail || finalOrder.customer?.email) {
      try {
        await this.sendOrderConfirmationEmail(finalOrder);
      }
      catch (error) {
        console.error('Failed to send order confirmation email:', error);
      }
    }

    return finalOrder;
  }


  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findById(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    let customerEmail = order.customerEmail;
    let customerName = order.customerName;
    let customerPhone = order.customerPhone;
    let customerId = order.customerId;

    // ✅ If customerId is updated
    if (updateOrderDto.customerId !== undefined) {
      if (updateOrderDto.customerId) {
        // Fetch new customer if customerId present
        const customer = await this.customerRepository.findOne({
          where: { id: updateOrderDto.customerId },
        });
        if (!customer) throw new BadRequestException(`Customer ${updateOrderDto.customerId} not found`);
        customerId = customer.id;
        customerEmail = customer.email;
        customerName = customer.name;
        customerPhone = customer.phone;
      } else {
        // ✅ No customerId → Guest mode
        customerId = null;
        customerEmail = updateOrderDto.customerEmail ?? customerEmail;
        customerName = updateOrderDto.customerName ?? customerName;
        customerPhone = updateOrderDto.customerPhone ?? customerPhone;
      }
    } else {
      // ✅ If no new customerId provided but guest details changed
      customerEmail = updateOrderDto.customerEmail ?? customerEmail;
      customerName = updateOrderDto.customerName ?? customerName;
      customerPhone = updateOrderDto.customerPhone ?? customerPhone;
    }

    // ✅ Allowed updates
    const allowedUpdates = {
      customerId,
      customerEmail,
      customerName,
      customerPhone,
      status: updateOrderDto.status ?? order.status,
      metadata: updateOrderDto.metadata ?? order.metadata,
    };

    await this.orderRepository.update(id, allowedUpdates);

    return this.findById(id);
  }


  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    await this.findById(id);
    await this.orderRepository.update(id, { status });
    return this.findById(id);
  }

  async getTodaysOrders(): Promise<Order[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.orderRepository.find({
      where: { createdAt: Between(today, tomorrow) },
      relations: ['items', 'items.menuItem', 'createdBy', 'customer', 'screen'],
      order: { createdAt: 'DESC' },
    });
  }

  async getOrderStats(dateFrom?: Date, dateTo?: Date) {
    const queryBuilder = this.orderRepository.createQueryBuilder('order');
    if (dateFrom && dateTo) {
      queryBuilder.where('order.createdAt BETWEEN :dateFrom AND :dateTo', { dateFrom, dateTo });
    }

    const [totalOrders, completedOrders, totalRevenue] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder.clone().andWhere('order.status = :status', { status: OrderStatus.COMPLETED }).getCount(),
      queryBuilder.clone()
        .andWhere('order.status = :status', { status: OrderStatus.COMPLETED })
        .select('SUM(order.total)', 'total').getRawOne(),
    ]);

    return {
      totalOrders,
      completedOrders,
      pendingOrders: totalOrders - completedOrders,
      totalRevenue: parseFloat(totalRevenue?.total || '0'),
      averageOrderValue:
        completedOrders > 0 ? parseFloat(totalRevenue?.total || '0') / completedOrders : 0,
    };
  }

  private async sendOrderConfirmationEmail(order: Order): Promise<void> {
    try {
      const orderData = {
        orderNumber: order.orderNumber,
        customerName: order.customerName || order.customer.name,
        email: order.customerEmail || order.customer.email,
        screenName: order.screen?.name,
        total: order.total,
        items: order.items.map(item => ({
          name: item.menuItem.name,
          quantity: item.quantity,
          price: item.price,
        })),
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt,
      };

      let res = await this.emailService.sendOrderConfirmation(orderData, orderData.email);
      console.log('Email sent response:', res);
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
      throw error;
    }
  }

  private async generateOrderNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

    const lastOrder = await this.orderRepository.findOne({
      where: { orderNumber: Like(`ORD-${dateStr}-%`) },
      order: { createdAt: 'DESC' },
    });

    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.orderNumber.split('-').pop() || '0');
      sequence = lastSequence + 1;
    }

    return `ORD-${dateStr}-${sequence.toString().padStart(3, '0')}`;
  }
}
