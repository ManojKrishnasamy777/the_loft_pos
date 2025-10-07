import { Order, EmailConfig } from '../types';

export class EmailService {
  private static getEmailConfig(): EmailConfig | null {
    const saved = localStorage.getItem('emailConfig');
    if (!saved) return null;

    const config = JSON.parse(saved);
    return config.isEnabled ? config : null;
  }

  static async sendOrderConfirmation(order: Order): Promise<boolean> {
    const config = this.getEmailConfig();

    if (!config) {
      console.log('Email service not configured or disabled');
      return false;
    }

    if (!order.customerEmail) {
      console.log('No customer email provided');
      return false;
    }

    try {
      const emailHtml = this.generateOrderEmailTemplate(order, config);

      console.log('Sending email to:', order.customerEmail);
      console.log('Email configuration:', {
        host: config.smtpHost,
        port: config.smtpPort,
        from: config.fromEmail,
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('Email sent successfully (simulated)');
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  private static generateOrderEmailTemplate(order: Order, config: EmailConfig): string {
    const orderDate = new Date(order.createdAt).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f3f4f6;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .logo {
      max-width: 150px;
      height: auto;
      margin-bottom: 20px;
    }
    .header-title {
      color: #ffffff;
      font-size: 28px;
      font-weight: bold;
      margin: 0;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      color: #111827;
      margin-bottom: 20px;
    }
    .order-info {
      background-color: #f9fafb;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .order-info-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .order-info-row:last-child {
      border-bottom: none;
    }
    .label {
      color: #6b7280;
      font-weight: 500;
    }
    .value {
      color: #111827;
      font-weight: 600;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .items-table th {
      background-color: #1f2937;
      color: #ffffff;
      padding: 12px;
      text-align: left;
      font-weight: 600;
    }
    .items-table td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
      color: #374151;
    }
    .items-table tr:last-child td {
      border-bottom: none;
    }
    .items-table .item-name {
      font-weight: 500;
    }
    .items-table .item-price {
      text-align: right;
    }
    .totals {
      background-color: #fef2f2;
      border: 2px solid #fecaca;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 16px;
    }
    .total-row.grand-total {
      border-top: 2px solid #dc2626;
      margin-top: 10px;
      padding-top: 15px;
      font-size: 20px;
      font-weight: bold;
      color: #dc2626;
    }
    .footer {
      background-color: #1f2937;
      color: #9ca3af;
      padding: 30px;
      text-align: center;
      font-size: 14px;
    }
    .footer-title {
      color: #ffffff;
      font-weight: 600;
      margin-bottom: 10px;
    }
    .status-badge {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 14px;
      text-transform: uppercase;
    }
    .status-completed {
      background-color: #d1fae5;
      color: #065f46;
    }
    .status-pending {
      background-color: #fef3c7;
      color: #92400e;
    }
    .status-cancelled {
      background-color: #fee2e2;
      color: #991b1b;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="header">
      ${config.logoUrl ? `<img src="${config.logoUrl}" alt="Logo" class="logo" />` : ''}
      <h1 class="header-title">Order Confirmation</h1>
    </div>

    <!-- Content -->
    <div class="content">
      <p class="greeting">Hello ${order.customerName || 'Valued Customer'},</p>
      <p style="color: #4b5563; line-height: 1.6;">
        Thank you for your order! We've received your payment and your order is being processed.
      </p>

      <!-- Order Information -->
      <div class="order-info">
        <div class="order-info-row">
          <span class="label">Order Number</span>
          <span class="value">${order.orderNumber}</span>
        </div>
        <div class="order-info-row">
          <span class="label">Order Date</span>
          <span class="value">${orderDate}</span>
        </div>
        <div class="order-info-row">
          <span class="label">Payment Method</span>
          <span class="value">${this.formatPaymentMethod(order.paymentMethod)}</span>
        </div>
        <div class="order-info-row">
          <span class="label">Status</span>
          <span class="status-badge status-${order.status}">${order.status}</span>
        </div>
      </div>

      <!-- Order Items -->
      <h2 style="color: #111827; font-size: 20px; margin-top: 30px;">Order Details</h2>
      <table class="items-table">
        <thead>
          <tr>
            <th>Item</th>
            <th style="text-align: center;">Quantity</th>
            <th style="text-align: right;">Price</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map(item => `
            <tr>
              <td class="item-name">${item.menuItem.name}</td>
              <td style="text-align: center;">${item.quantity}</td>
              <td class="item-price">₹${item.price.toFixed(2)}</td>
              <td class="item-price">₹${item.total.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- Totals -->
      <div class="totals">
        <div class="total-row">
          <span>Subtotal</span>
          <span>₹${order.subtotal.toFixed(2)}</span>
        </div>
        <div class="total-row">
          <span>Tax (GST)</span>
          <span>₹${order.taxAmount.toFixed(2)}</span>
        </div>
        <div class="total-row grand-total">
          <span>TOTAL</span>
          <span>₹${order.total.toFixed(2)}</span>
        </div>
      </div>

      <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 30px;">
        If you have any questions about your order, please don't hesitate to contact us.
        We're here to help!
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p class="footer-title">${config.fromName}</p>
      <p style="margin: 5px 0;">Thank you for choosing us!</p>
      <p style="margin: 15px 0 5px; font-size: 12px;">
        This is an automated email. Please do not reply to this message.
      </p>
    </div>
  </div>
</body>
</html>
    `;
  }

  private static formatPaymentMethod(method: string): string {
    const methodMap: Record<string, string> = {
      cash: 'Cash',
      card: 'Card Payment',
      upi: 'UPI Payment',
      netbanking: 'Net Banking',
    };
    return methodMap[method] || method;
  }
}
