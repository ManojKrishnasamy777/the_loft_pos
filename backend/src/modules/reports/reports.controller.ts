import {
  Controller,
  Get,
  Query,
  UseGuards,
  Param,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { ReportFilterDto } from './dto/report-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @ApiOperation({ summary: 'Get sales report' })
  @ApiResponse({ status: 200, description: 'Sales report retrieved successfully' })
  @Get('sales')
  getSalesReport(@Query() filterDto: ReportFilterDto) {
    return this.reportsService.getSalesReport(filterDto);
  }

  @ApiOperation({ summary: 'Get item performance report' })
  @ApiResponse({ status: 200, description: 'Item performance report retrieved successfully' })
  @Get('items')
  getItemPerformanceReport(@Query() filterDto: ReportFilterDto) {
    return this.reportsService.getItemPerformanceReport(filterDto);
  }

  @ApiOperation({ summary: 'Get daily sales report' })
  @ApiResponse({ status: 200, description: 'Daily sales report retrieved successfully' })
  @Get('daily')
  getDailySalesReport(@Query() filterDto: ReportFilterDto) {
    return this.reportsService.getDailySalesReport(filterDto);
  }

  @ApiOperation({ summary: 'Get customer analytics' })
  @ApiResponse({ status: 200, description: 'Customer analytics retrieved successfully' })
  @Get('customers')
  getCustomerAnalytics(@Query() filterDto: ReportFilterDto) {
    return this.reportsService.getCustomerAnalytics(filterDto);
  }

  @ApiOperation({ summary: 'Export report as CSV' })
  @ApiResponse({ status: 200, description: 'Report exported successfully' })
  @Get('export/:type')
  async exportReport(
    @Param('type') type: string,
    @Query() filterDto: ReportFilterDto,
    @Res() res: Response,
  ) {
    const csvData = await this.reportsService.exportReport(type, filterDto);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${type}-report-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvData);
  }
}