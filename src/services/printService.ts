import { apiClient } from '../config/api';

interface PrintOptions {
  showLogo?: boolean;
  showGst?: boolean;
  showQr?: boolean;
}

export class PrintService {
  private static async getSettings() {
    try {
      const settings = await apiClient.getSettings();
      return settings.reduce((acc: any, setting: any) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});
    } catch (error) {
      console.error('Failed to load settings:', error);
      return {};
    }
  }

  static async printReceipt(order: any, options: PrintOptions = {}) {
    debugger
    const settings = await this.getSettings();
    const printerEnabled = settings.printer_enabled === 'true';

    if (!printerEnabled) {
      console.log('Printer is disabled in settings');
      this.downloadReceipt(order, settings, options);
      return;
    }
    // eslint-disable-next-line no-debugger
    debugger;
    const receiptHtml = this.generateReceiptHtml(order, settings, options);

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(receiptHtml);
      printWindow.document.close();
      printWindow.focus();

      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    } else {
      alert('Please allow pop-ups to print receipts');
    }
  }

  private static generateReceiptHtml(order: any, settings: any, options: PrintOptions): string {
    const companyName = settings.company_name || 'The Loft Coimbatore';
    const companyAddress = settings.company_address || 'Coimbatore, Tamil Nadu';
    const companyPhone = settings.company_phone || '';
    const companyEmail = settings.company_email || '';
    const taxRate = parseFloat(settings.tax_rate || '0.18') * 100;
    const currencySymbol = settings.currency_symbol || '₹';
    const receiptFooter = settings.receipt_footer || 'Thank you for your visit!';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Receipt - ${order.orderNumber}</title>
        <style>
          @media print {
            body { margin: 0; padding: 0; }
            @page { margin: 0; }
          }
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.4;
            padding: 10px;
            max-width: 80mm;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            margin-bottom: 15px;
            border-bottom: 2px dashed #000;
            padding-bottom: 10px;
          }
          .company-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .company-details {
            font-size: 10px;
            margin: 2px 0;
          }
          .order-info {
            margin: 10px 0;
            border-bottom: 1px dashed #000;
            padding-bottom: 10px;
          }
          .items-table {
            width: 100%;
            margin: 10px 0;
            border-bottom: 1px dashed #000;
            padding-bottom: 10px;
          }
          .item-row {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
          }
          .item-name {
            flex: 1;
          }
          .item-qty {
            width: 40px;
            text-align: center;
          }
          .item-price {
            width: 80px;
            text-align: right;
          }
          .totals {
            margin: 10px 0;
            border-bottom: 2px dashed #000;
            padding-bottom: 10px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin: 3px 0;
          }
          .total-label {
            font-weight: bold;
          }
          .grand-total {
            font-size: 16px;
            font-weight: bold;
            margin-top: 5px;
          }
          .footer {
            text-align: center;
            margin-top: 15px;
            font-size: 11px;
          }
          .timestamp {
            text-align: center;
            font-size: 10px;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">${companyName}</div>
          <div class="company-details">${companyAddress}</div>
          ${companyPhone ? `<div class="company-details">Tel: ${companyPhone}</div>` : ''}
          ${companyEmail ? `<div class="company-details">Email: ${companyEmail}</div>` : ''}
          ${options.showGst && settings.company_gst ? `<div class="company-details">GSTIN: ${settings.company_gst}</div>` : ''}
        </div>

        <div class="order-info">
          <div><strong>Order #:</strong> ${order.orderNumber || order.order_number}</div>
          ${order.customer.name || order.customer_name ? `<div><strong>Customer:</strong> ${order.customer.name || order.customer_name}</div>` : ''}
          <div><strong>Date:</strong> ${new Date(order.createdAt || order.created_at || Date.now()).toLocaleString()}</div>
          ${order.screen ? `<div><strong>Screen:</strong> ${order.screen.name}</div>` : ''}
        </div>

        <div class="items-table">
          <div class="item-row" style="font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 5px;">
            <div class="item-name">Item</div>
            <div class="item-qty">Qty</div>
            <div class="item-price">Amount</div>
          </div>
          ${(order.items || order.orderItems || []).map((item: any) => `
            <div class="item-row">
              <div class="item-name">${item.menuItem?.name || item.name || 'Item'}</div>
              <div class="item-qty">${item.quantity}</div>
              <div class="item-price">${currencySymbol}${Number(item.subtotal || item.total_price || 0).toFixed(2)}</div>
            </div>
          `).join('')}
        </div>

        <div class="totals">
          <div class="total-row">
            <div>Subtotal:</div>
            <div>${currencySymbol}${Number(order.subtotal || 0).toFixed(2)}</div>
          </div>
          ${options.showGst ? `
            <div class="total-row">
              <div>GST (${taxRate}%):</div>
              <div>${currencySymbol}${Number(order.taxAmount || order.tax_amount || 0).toFixed(2)}</div>
            </div>
          ` : ''}
          ${order.discountAmount && order.discountAmount > 0 ? `
            <div class="total-row">
              <div>Discount:</div>
              <div>-${currencySymbol}${Number(order.discountAmount || order.discount_amount || 0).toFixed(2)}</div>
            </div>
          ` : ''}
          <div class="total-row grand-total">
            <div>TOTAL:</div>
            <div>${currencySymbol}${Number(order.total || 0).toFixed(2)}</div>
          </div>
        </div>

        ${order.payment ? `
          <div style="border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px;">
            <div><strong>Payment Method:</strong> ${order.payment.paymentMethod || order.payment.payment_method || 'Cash'}</div>
            <div><strong>Status:</strong> ${order.payment.paymentStatus || order.payment.payment_status || 'Paid'}</div>
          </div>
        ` : ''}

        <div class="footer">
          <div>${receiptFooter}</div>
        </div>

        <div class="timestamp">
          Printed on: ${new Date().toLocaleString()}
        </div>
      </body>
      </html>
    `;
  }

  private static downloadReceipt(order: any, settings: any, options: PrintOptions) {
    const receiptHtml = this.generateReceiptHtml(order, settings, options);
    const blob = new Blob([receiptHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${order.orderNumber || order.order_number}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  static async testPrint() {
    const testOrder = {
      orderNumber: 'TEST-001',
      customerName: 'Test Customer',
      createdAt: new Date().toISOString(),
      subtotal: 500,
      taxAmount: 90,
      total: 590,
      items: [
        {
          menuItem: { name: 'Test Item 1' },
          quantity: 2,
          totalPrice: 300
        },
        {
          menuItem: { name: 'Test Item 2' },
          quantity: 1,
          totalPrice: 200
        }
      ]
    };

    await this.printReceipt(testOrder, {
      showLogo: true,
      showGst: true,
      showQr: false
    });
  }
}
