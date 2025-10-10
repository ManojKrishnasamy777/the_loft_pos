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
        console.log('Printer config:', config);

        // ===========================
        // Determine Interface Type
        // ===========================
        let interfaceConn: string;

        switch (config.interface_type) {
            case 'USB':
                // Windows USB: wrap printer name in quotes
                interfaceConn = `printer:"${config.name}"`;
                break;

            case 'NETWORK':
                // TCP/IP network printer
                interfaceConn = `tcp://${config.network_ip}:${config.network_port || 9100}`;
                break;

            // case 'SERIAL':
            //     // Serial/COM printer
            //     interfaceConn = config.serial_port || 'COM1';
            //     break;

            // case 'BLUETOOTH':
            //     // Bluetooth printer (on Windows or Linux)
            //     interfaceConn = config.bluetooth_address || 'BTSERIAL:001';
            //     break;

            default:
                throw new Error('Unsupported printer interface type!');
        }

        console.log('Using interface:', interfaceConn);

        // ===========================
        // Create Thermal Printer Instance
        // ===========================
        let thermalPrinter: any = null;
        try {
            thermalPrinter = new printer({
                type: PrinterTypes.EPSON, // ESC/POS compatible
                interface: interfaceConn,
                options: { timeout: 5000 },
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                driver: config.interface_type === 'USB' ? require('printer') : undefined,
            });
        } catch (error: any) {
            console.error('❌ Print error:', error);
            return { success: false, message: error.message };
        }
        // ===========================
        // Check Printer Connection
        // ===========================
        const isConnected = await thermalPrinter.isPrinterConnected();
        console.log('Printer connected:', isConnected);
        if (!isConnected) throw new Error('Printer not reachable. Check connection!');

        // ===========================
        // PRINT HEADER
        // ===========================
        thermalPrinter.alignCenter();
        thermalPrinter.bold(true);
        thermalPrinter.println(receipt.storeName || 'My Store');
        thermalPrinter.bold(false);
        thermalPrinter.println(receipt.address || '');
        thermalPrinter.drawLine();

        // ===========================
        // PRINT ITEMS
        // ===========================
        receipt.items?.forEach((item: any) => {
            thermalPrinter.tableCustom([
                { text: item.name, align: 'LEFT', width: 0.5 },
                { text: `${item.qty} x ₹${item.price}`, align: 'RIGHT', width: 0.5 },
            ]);
        });

        thermalPrinter.drawLine();
        thermalPrinter.alignRight();
        thermalPrinter.bold(true);
        thermalPrinter.println(`TOTAL: ₹${receipt.total}`);
        thermalPrinter.bold(false);

        // ===========================
        // OPTIONAL QR CODE
        // ===========================
        if (receipt.qrCode) {
            thermalPrinter.println('');
            thermalPrinter.alignCenter();
            thermalPrinter.printQR(receipt.qrCode, { cellSize: 6 });
        }

        thermalPrinter.cut();

        // ===========================
        // EXECUTE PRINT
        // ===========================
        try {
            await thermalPrinter.execute();
            console.log('✅ Print success');
            return { success: true };
        } catch (error: any) {
            console.error('❌ Print error:', error);
            return { success: false, message: error.message };
        }
    }
}
