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
      .leftJoinAndSelect('menuItem.category', 'category')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.screen', 'screen');

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
    const { dateFrom, dateTo, status } = filterDto;

    const queryBuilder = this.orderItemRepository.createQueryBuilder('orderItem')
      .leftJoinAndSelect('orderItem.menuItem', 'menuItem')
      .leftJoinAndSelect('menuItem.category', 'category')
      .leftJoinAndSelect('orderItem.order', 'order');

    if (status) {
      queryBuilder.where('order.status = :status', { status });
    }

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
    const { dateFrom, dateTo, status } = filterDto;

    const startDate = dateFrom ? new Date(dateFrom) : new Date();
    const endDate = dateTo ? new Date(dateTo) : new Date();

    if (!dateFrom) {
      startDate.setDate(startDate.getDate() - 30);
    }

    const whereConditions: any = {
      createdAt: Between(startDate, endDate),
    };

    if (status) {
      whereConditions.status = status;
    }

    const orders = await this.orderRepository.find({
      where: whereConditions,
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
    const { dateFrom, dateTo, status } = filterDto;

    const queryBuilder = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.screen', 'screen')
      .where('(order.customerEmail IS NOT NULL OR order.customerId IS NOT NULL)');

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

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
      const key = order.customerId || order.customerEmail || 'walk-in';
      if (customerAnalytics.has(key)) {
        const existing = customerAnalytics.get(key);
        existing.totalSpent += parseFloat(order.total.toString());
        existing.orderCount += 1;
        existing.lastOrderDate = order.createdAt > existing.lastOrderDate ? order.createdAt : existing.lastOrderDate;
      } else {
        customerAnalytics.set(key, {
          customerId: order.customerId,
          customerEmail: order.customerEmail,
          customerName: order.customer?.name || order.customerName,
          customerPhone: order.customer?.phone,
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
    const escapeCSV = (value: any): string => {
      if (value == null) return '';
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    if (reportType === 'sales') {
      let csv = 'Sales Report\n\n';
      csv += 'Summary\n';
      csv += 'Metric,Value\n';
      csv += `Total Sales,₹${(data.totalSales || 0).toFixed(2)}\n`;
      csv += `Total Orders,${data.totalOrders || 0}\n`;
      csv += `Average Order Value,₹${(data.averageOrderValue || 0).toFixed(2)}\n`;
      csv += `Generated On,${new Date().toISOString()}\n\n`;

      if (data.topItems && data.topItems.length > 0) {
        csv += 'Top Selling Items\n';
        csv += 'Rank,Item Name,Category,Quantity Sold,Revenue\n';
        data.topItems.forEach((item, index) => {
          csv += `${index + 1},${escapeCSV(item.item.name)},${escapeCSV(item.item.category?.name || 'N/A')},${item.quantity},₹${item.revenue.toFixed(2)}\n`;
        });
        csv += '\n';
      }

      if (data.salesByCategory && data.salesByCategory.length > 0) {
        csv += 'Sales by Category\n';
        csv += 'Category,Sales,Order Count\n';
        data.salesByCategory.forEach(cat => {
          csv += `${escapeCSV(cat.category?.name || 'Unknown')},₹${cat.sales.toFixed(2)},${cat.orderCount}\n`;
        });
        csv += '\n';
      }

      if (data.salesByPaymentMethod && data.salesByPaymentMethod.length > 0) {
        csv += 'Sales by Payment Method\n';
        csv += 'Payment Method,Sales,Order Count\n';
        data.salesByPaymentMethod.forEach(pm => {
          csv += `${escapeCSV(pm.method)},₹${pm.sales.toFixed(2)},${pm.orderCount}\n`;
        });
        csv += '\n';
      }

      return csv;
    }

    if (reportType === 'items') {
      let csv = 'Item Performance Report\n\n';
      csv += 'Generated On,' + new Date().toISOString() + '\n\n';
      csv += 'Item Name,Category,Total Quantity,Total Revenue,Order Count,Average Price\n';

      if (Array.isArray(data)) {
        data.forEach(item => {
          csv += `${escapeCSV(item.menuItem?.name || 'Unknown')},`;
          csv += `${escapeCSV(item.menuItem?.category?.name || 'N/A')},`;
          csv += `${item.totalQuantity || 0},`;
          csv += `₹${(item.totalRevenue || 0).toFixed(2)},`;
          csv += `${item.orderCount || 0},`;
          csv += `₹${(item.averagePrice || 0).toFixed(2)}\n`;
        });
      }

      return csv;
    }

    if (reportType === 'daily') {
      let csv = 'Daily Sales Report\n\n';
      csv += 'Generated On,' + new Date().toISOString() + '\n\n';
      csv += 'Date,Sales,Order Count\n';

      if (Array.isArray(data)) {
        data.forEach(day => {
          csv += `${day.date},₹${(day.sales || 0).toFixed(2)},${day.orderCount || 0}\n`;
        });

        const totalSales = data.reduce((sum, day) => sum + (day.sales || 0), 0);
        const totalOrders = data.reduce((sum, day) => sum + (day.orderCount || 0), 0);
        csv += '\nTotals\n';
        csv += `Total Sales,₹${totalSales.toFixed(2)}\n`;
        csv += `Total Orders,${totalOrders}\n`;
        csv += `Average Daily Sales,₹${(totalSales / data.length).toFixed(2)}\n`;
      }

      return csv;
    }

    if (reportType === 'customers') {
      let csv = 'Customer Analytics Report\n\n';
      csv += 'Summary\n';
      csv += 'Metric,Value\n';
      csv += `Total Customers,${data.totalCustomers || 0}\n`;
      csv += `Repeat Customers,${data.repeatCustomers || 0}\n`;
      csv += `Average Order Value,₹${(data.averageOrderValue || 0).toFixed(2)}\n`;
      csv += `Generated On,${new Date().toISOString()}\n\n`;

      if (data.topCustomers && data.topCustomers.length > 0) {
        csv += 'Top Customers\n';
        csv += 'Customer Name,Email,Phone,Order Count,Total Spent,Average Order Value,First Order,Last Order\n';
        data.topCustomers.forEach(customer => {
          csv += `${escapeCSV(customer.customerName || 'N/A')},`;
          csv += `${escapeCSV(customer.customerEmail || 'N/A')},`;
          csv += `${escapeCSV(customer.customerPhone || 'N/A')},`;
          csv += `${customer.orderCount || 0},`;
          csv += `₹${(customer.totalSpent || 0).toFixed(2)},`;
          csv += `₹${(customer.averageOrderValue || 0).toFixed(2)},`;
          csv += `${customer.firstOrderDate ? new Date(customer.firstOrderDate).toLocaleDateString() : 'N/A'},`;
          csv += `${customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : 'N/A'}\n`;
        });
      }

      return csv;
    }

    return JSON.stringify(data, null, 2);
  }
}