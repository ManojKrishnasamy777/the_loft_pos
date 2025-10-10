import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ThermalPrintService } from './thermal-print.service';
import { PrintReceiptDto } from './dto/print-receipt.dto';

@ApiTags('Print Receipt')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('print')
export class PrintController {
  constructor(private readonly thermalPrintService: ThermalPrintService) { }

  @Post('receipt')
  @ApiOperation({ summary: 'Print receipt on thermal printer' })
  printReceipt(@Body() receipt: PrintReceiptDto) {
    return this.thermalPrintService.printReceipt(receipt);
  }

  @Post('test')
  @ApiOperation({ summary: 'Test print on thermal printer' })
  testPrint() {
    return this.thermalPrintService.testPrint();
  }
}
