import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderFilterDto } from './dto/order-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrderStatus } from '../../entities/order.entity';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    return this.ordersService.create(createOrderDto, req.user.id);
  }

  @ApiOperation({ summary: 'Get all orders with filters' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  @Get()
  findAll(@Query() filterDto: OrderFilterDto) {
    return this.ordersService.findAll(filterDto);
  }

  @ApiOperation({ summary: 'Get today\'s orders' })
  @ApiResponse({ status: 200, description: 'Today\'s orders retrieved successfully' })
  @Get('today')
  getTodaysOrders() {
    return this.ordersService.getTodaysOrders();
  }

  @ApiOperation({ summary: 'Get order statistics' })
  @ApiResponse({ status: 200, description: 'Order statistics retrieved successfully' })
  @Get('stats')
  getOrderStats(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const from = dateFrom ? new Date(dateFrom) : undefined;
    const to = dateTo ? new Date(dateTo) : undefined;
    return this.ordersService.getOrderStats(from, to);
  }

  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findById(id);
  }

  @ApiOperation({ summary: 'Update order' })
  @ApiResponse({ status: 200, description: 'Order updated successfully' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @ApiOperation({ summary: 'Update order status' })
  @ApiResponse({ status: 200, description: 'Order status updated successfully' })
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: OrderStatus) {
    return this.ordersService.updateStatus(id, status);
  }
}