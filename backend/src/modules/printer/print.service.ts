// print.service.ts
import { Injectable } from '@nestjs/common';
import * as ThermalPrinter from 'node-thermal-printer';
const { printer, types: PrinterTypes } = ThermalPrinter;
import { PrinterConfigService } from './printer-config.service';

@Injectable()
export class PrintService {
    constructor(private printerConfigService: PrinterConfigService) { }

    async print(receipt: any) {
        const config = await this.printerConfigService.getDefaultPrinter();

        if (!config) throw new Error('No printer configured!');

        const thermalPrinter = new printer({
            type: PrinterTypes[config.type],
            interface:
                config.interface_type === 'USB'
                    ? config.usb_identifier || 'usb'
                    : `tcp://${config.network_ip}:${config.network_port}`,
        });

        // Header
        thermalPrinter.alignCenter();
        // if (receipt.logo) thermalPrinter.printImage(receipt.logo);
        thermalPrinter.println(receipt.storeName);
        thermalPrinter.println(receipt.address || '');
        thermalPrinter.println('-----------------------------');

        // Items
        receipt.items.forEach(item => {
            thermalPrinter.tableCustom([
                { text: item.name, align: 'LEFT', width: 0.5 },
                { text: `${item.qty} x $${item.price}`, align: 'RIGHT', width: 0.5 },
            ]);
        });

        thermalPrinter.println('-----------------------------');
        thermalPrinter.alignRight();
        thermalPrinter.println(`Total: $${receipt.total}`);

        // QR code
        if (receipt.qrCode) {
            thermalPrinter.println('');
            thermalPrinter.alignCenter();
            thermalPrinter.printQR(receipt.qrCode, { cellSize: 6 });
        }

        thermalPrinter.cut();

        try {
            await thermalPrinter.execute();
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
}
