// thermal-print.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrinterConfigService } from './printer-config.service';
import { PrintReceiptDto } from './dto/print-receipt.dto';
import * as escpos from 'escpos';
import { Network } from 'escpos-network';
const usb = require('usb'); // Correct import for Node

@Injectable()
export class ThermalPrintService {
  private readonly logger = new Logger(ThermalPrintService.name);

  constructor(private printerConfigService: PrinterConfigService) { }

  async printReceipt(receipt: PrintReceiptDto): Promise<{ success: boolean; message?: string }> {
    try {
      const config = await this.printerConfigService.findDefault();
      if (!config) throw new Error('No default printer configured.');

      this.logger.log(`Printing to: ${config.name} (${config.interface_type})`);

      let device: any;

      if (config.interface_type === 'USB') {
        // Auto-detect first USB printer
        const devices = usb.getDeviceList();
        if (devices.length === 0) throw new Error('No USB printers detected');

        // Optional: filter by known thermal printer classes (0x07 for printer)
        const printerDevice = devices.find(d => d.deviceDescriptor.bDeviceClass === 0x07) || devices[0];
        printerDevice.open();

        device = new escpos.USB(printerDevice);
      } else if (config.interface_type === 'NETWORK') {
        device = new Network(config.network_ip, config.network_port || 9100);
      } else {
        throw new Error('Unsupported printer interface type');
      }

      const printer = new escpos.Printer(device);

      await new Promise<void>((resolve, reject) => {
        device.open((err: any) => {
          if (err) return reject(err);
          try {
            printer.align('CT').style('B').size(2, 2).text(receipt.storeName || '');
            printer.size(1, 1).style('NORMAL').text(receipt.address || '').text('');

            printer.align('LT');
            printer.text(`Order: ${receipt.orderNumber || ''}`);
            printer.text(`Customer: ${receipt.customerName || ''}`);
            printer.text(`Date: ${new Date().toLocaleString('en-IN')}`);
            printer.text('--------------------------------');

            printer.text(this.padColumns(['ITEM', 'QTY', 'PRICE', 'TOTAL'], [20, 6, 8, 8]));
            (receipt.items || []).forEach(item => {
              const name = String(item.name || '').slice(0, 20);
              const qty = String(item.qty || 0);
              const price = (item.price || 0).toFixed(2);
              const total = ((item.qty || 0) * (item.price || 0)).toFixed(2);
              printer.text(this.padColumns([name, qty, `₹${price}`, `₹${total}`], [20, 6, 8, 8]));
            });
            printer.text('--------------------------------');

            printer.text(this.padRightLabelValue('Subtotal', `₹${receipt.subtotal.toFixed(2)}`, 42));
            printer.text(this.padRightLabelValue('Tax', `₹${receipt.tax.toFixed(2)}`, 42));
            printer.style('B');
            printer.text(this.padRightLabelValue('TOTAL', `₹${receipt.total.toFixed(2)}`, 42));
            printer.style('NORMAL');

            printer.text(`Payment: ${receipt.paymentMethod || ''}`).text('');

            if (receipt.qrCode) {
              printer.align('CT');
              printer.qr(receipt.qrCode, { model: 2, size: 6, error: 'M' }).text('');
            }

            printer.align('CT').text('Thank you for your visit!').text('');
            printer.feed(3).cut().close();

            resolve();
          } catch (e) {
            reject(e);
          }
        });
      });

      return { success: true, message: 'Printed successfully' };
    } catch (err: any) {
      this.logger.error('Print error', err);
      return { success: false, message: err.message || String(err) };
    }
  }

  async testPrint(): Promise<{ success: boolean; message?: string }> {
    const testReceipt: PrintReceiptDto = {
      storeName: 'THE LOFT COIMBATORE',
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

  private padColumns(cols: string[], widths: number[]): string {
    let line = '';
    for (let i = 0; i < cols.length; i++) {
      const txt = cols[i] ?? '';
      const w = widths[i] ?? 10;
      line += i === cols.length - 1 ? txt.toString().padStart(w) : txt.toString().padEnd(w);
    }
    return line;
  }

  private padRightLabelValue(label: string, value: string, totalWidth: number): string {
    const left = label + ': ';
    const right = value;
    const space = totalWidth - left.length - right.length;
    return left + (space > 0 ? ' '.repeat(space) : ' ') + right;
  }
}
