import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Order, OrderStatus } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { Payment, PaymentStatus } from '../../entities/payment.entity';
import { MenuItem } from '../../entities/menu-item.entity';
import { Category } from '../../entities/category.entity';
import { ReportFilterDto } from './dto/report-filter.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) { }

  async getSalesReport(filterDto: ReportFilterDto) {
    const { dateFrom, dateTo, paymentMethod, status } = filterDto;

    const queryBuilder = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.menuItem', 'menuItem')
      .leftJoinAndSelect('menuItem.category', 'category');

    // Apply filters
    if (dateFrom && dateTo) {
      queryBuilder.andWhere('order.createdAt BETWEEN :dateFrom AND :dateTo', {
        dateFrom: new Date(dateFrom),
        dateTo: new Date(dateTo),
      });
    }

    if (paymentMethod) {
      queryBuilder.andWhere('order.paymentMethod = :paymentMethod', { paymentMethod });
    }

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    } else {
      queryBuilder.andWhere('order.status = :status', { status: OrderStatus.COMPLETED });
    }

    const orders = await queryBuilder.getMany();

    // Calculate totals
    const totalSales = orders.reduce((sum, order) => sum + parseFloat(order.total.toString()), 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Top selling items
    const itemSales = new Map();
    orders.forEach(order => {
      order.items.forEach(item => {
        const key = item.menuItem.id;
        if (itemSales.has(key)) {
          const existing = itemSales.get(key);
          existing.quantity += item.quantity;
          existing.revenue += parseFloat(item.total.toString());
        } else {
          itemSales.set(key, {
            item: item.menuItem,
            quantity: item.quantity,
            revenue: parseFloat(item.total.toString()),
          });
        }
      });
    });

    const topItems = Array.from(itemSales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Sales by category
    const categorySales = new Map();
    orders.forEach(order => {
      order.items.forEach(item => {
        const key = item.menuItem.category.id;
        if (categorySales.has(key)) {
          const existing = categorySales.get(key);
          existing.sales += parseFloat(item.total.toString());
          existing.orderCount += 1;
        } else {
          categorySales.set(key, {
            category: item.menuItem.category,
            sales: parseFloat(item.total.toString()),
            orderCount: 1,
          });
        }
      });
    });

    const salesByCategory = Array.from(categorySales.values())
      .sort((a, b) => b.sales - a.sales);

    // Sales by payment method
    const paymentMethodSales = new Map();
    orders.forEach(order => {
      const key = order.paymentMethod;
      if (paymentMethodSales.has(key)) {
        const existing = paymentMethodSales.get(key);
        existing.sales += parseFloat(order.total.toString());
        existing.orderCount += 1;
      } else {
        paymentMethodSales.set(key, {
          method: key,
          sales: parseFloat(order.total.toString()),
          orderCount: 1,
        });
      }
    });

    const salesByPaymentMethod = Array.from(paymentMethodSales.values());

    // Sales by hour
    const hourlySales = new Array(24).fill(0).map((_, hour) => ({
      hour,
      sales: 0,
      orderCount: 0,
    }));

    orders.forEach(order => {
      const hour = new Date(order.createdAt).getHours();
      hourlySales[hour].sales += parseFloat(order.total.toString());
      hourlySales[hour].orderCount += 1;
    });

    return {
      totalSales,
      totalOrders,
      averageOrderValue,
      topItems,
      salesByCategory,
      salesByPaymentMethod,
      salesByHour: hourlySales.filter(h => h.sales > 0),
    };
  }

  async getItemPerformanceReport(filterDto: ReportFilterDto) {
    const { dateFrom, dateTo } = filterDto;

    const queryBuilder = this.orderItemRepository.createQueryBuilder('orderItem')
      .leftJoinAndSelect('orderItem.menuItem', 'menuItem')
      .leftJoinAndSelect('menuItem.category', 'category')
      .leftJoinAndSelect('orderItem.order', 'order')
      .where('order.status = :status', { status: OrderStatus.COMPLETED });

    if (dateFrom && dateTo) {
      queryBuilder.andWhere('order.createdAt BETWEEN :dateFrom AND :dateTo', {
        dateFrom: new Date(dateFrom),
        dateTo: new Date(dateTo),
      });
    }

    const orderItems = await queryBuilder.getMany();

    // Group by menu item
    const itemPerformance = new Map();
    orderItems.forEach(item => {
      const key = item.menuItem.id;
      if (itemPerformance.has(key)) {
        const existing = itemPerformance.get(key);
        existing.totalQuantity += item.quantity;
        existing.totalRevenue += parseFloat(item.total.toString());
        existing.orderCount += 1;
      } else {
        itemPerformance.set(key, {
          menuItem: item.menuItem,
          totalQuantity: item.quantity,
          totalRevenue: parseFloat(item.total.toString()),
          orderCount: 1,
          averagePrice: parseFloat(item.price.toString()),
        });
      }
    });

    return Array.from(itemPerformance.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue);
  }

  async getDailySalesReport(filterDto: ReportFilterDto) {
    const { dateFrom, dateTo } = filterDto;

    const startDate = dateFrom ? new Date(dateFrom) : new Date();
    const endDate = dateTo ? new Date(dateTo) : new Date();

    if (!dateFrom) {
      startDate.setDate(startDate.getDate() - 30); // Last 30 days by default
    }

    const orders = await this.orderRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
        status: OrderStatus.COMPLETED,
      },
      order: { createdAt: 'ASC' },
    });

    // Group by date
    const dailySales = new Map();
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (dailySales.has(date)) {
        const existing = dailySales.get(date);
        existing.sales += parseFloat(order.total.toString());
        existing.orderCount += 1;
      } else {
        dailySales.set(date, {
          date,
          sales: parseFloat(order.total.toString()),
          orderCount: 1,
        });
      }
    });

    return Array.from(dailySales.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  async getCustomerAnalytics(filterDto: ReportFilterDto) {
    const { dateFrom, dateTo } = filterDto;

    const queryBuilder = this.orderRepository.createQueryBuilder('order')
      .where('order.status = :status', { status: OrderStatus.COMPLETED })
      .andWhere('order.customerEmail IS NOT NULL');

    if (dateFrom && dateTo) {
      queryBuilder.andWhere('order.createdAt BETWEEN :dateFrom AND :dateTo', {
        dateFrom: new Date(dateFrom),
        dateTo: new Date(dateTo),
      });
    }

    const orders = await queryBuilder.getMany();

    // Group by customer
    const customerAnalytics = new Map();
    orders.forEach(order => {
      const key = order.customerEmail;
      if (customerAnalytics.has(key)) {
        const existing = customerAnalytics.get(key);
        existing.totalSpent += parseFloat(order.total.toString());
        existing.orderCount += 1;
        existing.lastOrderDate = order.createdAt > existing.lastOrderDate ? order.createdAt : existing.lastOrderDate;
      } else {
        customerAnalytics.set(key, {
          customerEmail: order.customerEmail,
          customerName: order.customerName,
          totalSpent: parseFloat(order.total.toString()),
          orderCount: 1,
          firstOrderDate: order.createdAt,
          lastOrderDate: order.createdAt,
        });
      }
    });

    const customers = Array.from(customerAnalytics.values())
      .map(customer => ({
        ...customer,
        averageOrderValue: customer.totalSpent / customer.orderCount,
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent);

    return {
      totalCustomers: customers.length,
      repeatCustomers: customers.filter(c => c.orderCount > 1).length,
      topCustomers: customers.slice(0, 20),
      averageOrderValue: customers.reduce((sum, c) => sum + c.averageOrderValue, 0) / customers.length || 0,
    };
  }

  async exportReport(reportType: string, filterDto: ReportFilterDto) {
    let data;

    switch (reportType) {
      case 'sales':
        data = await this.getSalesReport(filterDto);
        break;
      case 'items':
        data = await this.getItemPerformanceReport(filterDto);
        break;
      case 'daily':
        data = await this.getDailySalesReport(filterDto);
        break;
      case 'customers':
        data = await this.getCustomerAnalytics(filterDto);
        break;
      default:
        throw new Error('Invalid report type');
    }

    // Convert to CSV format
    return this.convertToCSV(data, reportType);
  }

  private convertToCSV(data: any, reportType: string): string {
    // This is a simplified CSV conversion
    // In a real application, you might want to use a proper CSV library

    if (reportType === 'sales') {
      let csv = 'Date,Total Sales,Total Orders,Average Order Value\n';
      csv += `${new Date().toISOString().split('T')[0]},${data.totalSales},${data.totalOrders},${data.averageOrderValue}\n`;

      csv += '\nTop Items\n';
      csv += 'Item Name,Quantity Sold,Revenue\n';
      data.topItems.forEach(item => {
        csv += `${item.item.name},${item.quantity},${item.revenue}\n`;
      });

      return csv;
    }

    // Add other report type conversions as needed
    return JSON.stringify(data, null, 2);
  }
}