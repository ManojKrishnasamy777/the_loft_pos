// print.controller.ts
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PrintService } from './print.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('receipt')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('receipt')
export class PrintController {
  constructor(private readonly printService: PrintService) { }

  @Post('print')
  async print(@Body() receipt: any) {
    return this.printService.print(receipt);
  }
}
