import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
// ✅ Added Like to the imports
import { Repository, Between, Like } from 'typeorm';
import { Order, OrderStatus } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { MenuItem } from '../../entities/menu-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderFilterDto } from './dto/order-filter.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
  ) { }

  async findAll(filterDto?: OrderFilterDto): Promise<{ orders: Order[]; total: number }> {
    const queryBuilder = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.menuItem', 'menuItem')
      .leftJoinAndSelect('order.createdBy', 'createdBy')
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
      relations: ['items', 'items.menuItem', 'createdBy', 'payments'],
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async create(createOrderDto: CreateOrderDto, userId: string): Promise<Order> {
    const orderNumber = await this.generateOrderNumber();
    let subtotal = 0;
    let taxAmount = 0;
    const orderItems: Partial<OrderItem>[] = [];

    for (const item of createOrderDto.items) {
      const menuItem = await this.menuItemRepository.findOne({
        where: { id: item.menuItemId, isActive: true },
      });
      if (!menuItem) {
        throw new BadRequestException(`Menu item ${item.menuItemId} not found or inactive`);
      }

      const itemSubtotal = menuItem.price * item.quantity;
      const itemTaxAmount = itemSubtotal * menuItem.taxRate;
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
      taxAmount += itemTaxAmount;
    }

    const total = subtotal + taxAmount;

    const order = this.orderRepository.create({
      orderNumber,
      subtotal,
      taxAmount,
      total,
      customerEmail: createOrderDto.customerEmail,
      customerName: createOrderDto.customerName,
      customerPhone: createOrderDto.customerPhone,
      paymentMethod: createOrderDto.paymentMethod,
      status: OrderStatus.PENDING,
      createdById: userId,
      metadata: createOrderDto.metadata,
    });

    const savedOrder = await this.orderRepository.save(order);

    for (const item of orderItems) {
      const orderItem = this.orderItemRepository.create({
        ...item,
        orderId: savedOrder.id,
      });
      await this.orderItemRepository.save(orderItem);
    }

    return this.findById(savedOrder.id);
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findById(id);
    const allowedUpdates = {
      customerEmail: updateOrderDto.customerEmail,
      customerName: updateOrderDto.customerName,
      customerPhone: updateOrderDto.customerPhone,
      status: updateOrderDto.status,
      metadata: updateOrderDto.metadata,
    };
    Object.keys(allowedUpdates).forEach(
      key => allowedUpdates[key] === undefined && delete allowedUpdates[key]
    );
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
      relations: ['items', 'items.menuItem', 'createdBy'],
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
