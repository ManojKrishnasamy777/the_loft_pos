import { Injectable, Logger } from '@nestjs/common';
import { PrinterConfigService } from './printer-config.service';
import { PrintReceiptDto } from './dto/print-receipt.dto';
import * as ThermalPrinter from 'node-thermal-printer';

@Injectable()
export class ThermalPrintService {
  private readonly logger = new Logger(ThermalPrintService.name);

  constructor(private printerConfigService: PrinterConfigService) {}

  async printReceipt(receipt: PrintReceiptDto): Promise<{ success: boolean; message?: string }> {
    try {
      const config = await this.printerConfigService.findDefault();
      this.logger.log(`Using printer: ${config.name} (${config.interface_type})`);

      const printer = this.createPrinterInstance(config);

      const isConnected = await printer.isPrinterConnected();
      if (!isConnected) {
        throw new Error('Printer not reachable. Check connection!');
      }

      this.buildReceipt(printer, receipt);

      await printer.execute();
      this.logger.log('Receipt printed successfully');

      return { success: true, message: 'Receipt printed successfully' };
    } catch (error: any) {
      this.logger.error('Print error:', error);
      return { success: false, message: error.message };
    }
  }

  async testPrint(): Promise<{ success: boolean; message?: string }> {
    const testReceipt: PrintReceiptDto = {
      storeName: 'The Loft Coimbatore',
      address: 'Coimbatore, Tamil Nadu',
      orderNumber: 'TEST-001',
      customerName: 'Test Customer',
      items: [
        { name: 'Cappuccino', qty: 2, price: 150 },
        { name: 'Croissant', qty: 1, price: 80 },
      ],
      subtotal: 380,
      tax: 68.4,
      total: 448.4,
      paymentMethod: 'Cash',
      qrCode: 'TEST-001',
    };

    return this.printReceipt(testReceipt);
  }

  private createPrinterInstance(config: any): any {
    let interfaceConn: string;
    const printerType = this.getPrinterType(config.type);

    switch (config.interface_type) {
      case 'USB':
        interfaceConn = `printer:"${config.name}"`;
        break;
      case 'NETWORK':
        interfaceConn = `tcp://${config.network_ip}:${config.network_port || 9100}`;
        break;
      default:
        throw new Error('Unsupported printer interface type');
    }

    this.logger.log(`Interface: ${interfaceConn}`);

    const printerOptions: any = {
      type: printerType,
      interface: interfaceConn,
      options: { timeout: 5000 },
      width: 48,
    };

    if (config.interface_type === 'USB') {
      try {
        printerOptions.driver = require('printer');
      } catch (error) {
        this.logger.warn('USB driver not available, using default');
      }
    }

    return new ThermalPrinter.printer(printerOptions);
  }

  private getPrinterType(type: string): any {
    const types = ThermalPrinter.types;
    switch (type) {
      case 'EPSON':
        return types.EPSON;
      case 'STAR':
        return types.STAR;
      case 'GENERIC':
        return types.GENERIC;
      default:
        return types.EPSON;
    }
  }

  private buildReceipt(printer: any, receipt: PrintReceiptDto): void {
    printer.alignCenter();
    printer.bold(true);
    printer.setTextSize(1, 1);
    printer.println(receipt.storeName);
    printer.bold(false);
    printer.setTextNormal();
    printer.println(receipt.address);
    printer.drawLine();

    printer.alignLeft();
    printer.println(`Order: ${receipt.orderNumber}`);
    printer.println(`Customer: ${receipt.customerName}`);
    printer.println(`Date: ${new Date().toLocaleString('en-IN')}`);
    printer.drawLine();

    printer.tableCustom([
      { text: 'Item', align: 'LEFT', width: 0.5, bold: true },
      { text: 'Qty', align: 'CENTER', width: 0.15, bold: true },
      { text: 'Price', align: 'RIGHT', width: 0.2, bold: true },
      { text: 'Total', align: 'RIGHT', width: 0.15, bold: true },
    ]);

    receipt.items.forEach((item) => {
      const itemTotal = item.qty * item.price;
      printer.tableCustom([
        { text: item.name, align: 'LEFT', width: 0.5 },
        { text: `${item.qty}`, align: 'CENTER', width: 0.15 },
        { text: `₹${item.price.toFixed(2)}`, align: 'RIGHT', width: 0.2 },
        { text: `₹${itemTotal.toFixed(2)}`, align: 'RIGHT', width: 0.15 },
      ]);
    });

    printer.drawLine();

    printer.tableCustom([
      { text: 'Subtotal:', align: 'LEFT', width: 0.7 },
      { text: `₹${receipt.subtotal.toFixed(2)}`, align: 'RIGHT', width: 0.3 },
    ]);

    printer.tableCustom([
      { text: 'Tax:', align: 'LEFT', width: 0.7 },
      { text: `₹${receipt.tax.toFixed(2)}`, align: 'RIGHT', width: 0.3 },
    ]);

    printer.drawLine();
    printer.bold(true);
    printer.setTextSize(1, 1);
    printer.tableCustom([
      { text: 'TOTAL:', align: 'LEFT', width: 0.7, bold: true },
      { text: `₹${receipt.total.toFixed(2)}`, align: 'RIGHT', width: 0.3, bold: true },
    ]);
    printer.setTextNormal();
    printer.bold(false);

    printer.drawLine();
    printer.println(`Payment: ${receipt.paymentMethod}`);

    if (receipt.qrCode) {
      printer.println('');
      printer.alignCenter();
      printer.printQR(receipt.qrCode, { cellSize: 6, model: 2 });
    }

    printer.println('');
    printer.alignCenter();
    printer.println('Thank you for your visit!');
    printer.println('');

    printer.cut();
  }
}
