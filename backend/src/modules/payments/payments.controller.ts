import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @ApiOperation({ summary: 'Create Razorpay order' })
  @ApiResponse({ status: 201, description: 'Razorpay order created successfully' })
  @Post('razorpay/create-order/:orderId')
  createRazorpayOrder(@Param('orderId') orderId: string) {
    return this.paymentsService.createRazorpayOrder(orderId);
  }

  @ApiOperation({ summary: 'Create payment record' })
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.createPayment(createPaymentDto);
  }

  @ApiOperation({ summary: 'Verify Razorpay payment' })
  @ApiResponse({ status: 200, description: 'Payment verified successfully' })
  @Post('verify')
  verify(@Body() verifyPaymentDto: VerifyPaymentDto) {
    return this.paymentsService.verifyPayment(verifyPaymentDto);
  }

  @ApiOperation({ summary: 'Refund payment' })
  @ApiResponse({ status: 200, description: 'Payment refunded successfully' })
  @Post(':id/refund')
  refund(@Param('id') id: string, @Body('amount') amount?: number) {
    return this.paymentsService.refundPayment(id, amount);
  }

  @ApiOperation({ summary: 'Get all payments' })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
  @Get()
  findAll() {
    return this.paymentsService.findAll();
  }

  @ApiOperation({ summary: 'Get payment statistics' })
  @ApiResponse({ status: 200, description: 'Payment statistics retrieved successfully' })
  @Get('stats')
  getPaymentStats(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const from = dateFrom ? new Date(dateFrom) : undefined;
    const to = dateTo ? new Date(dateTo) : undefined;
    return this.paymentsService.getPaymentStats(from, to);
  }

  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({ status: 200, description: 'Payment retrieved successfully' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findById(id);
  }
}