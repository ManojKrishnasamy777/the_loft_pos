import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { AuditFilterDto } from './dto/audit-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @ApiOperation({ summary: 'Get audit logs with filters' })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved successfully' })
  @Get()
  findAll(@Query() filterDto: AuditFilterDto) {
    return this.auditService.findAll(filterDto);
  }

  @ApiOperation({ summary: 'Get audit statistics' })
  @ApiResponse({ status: 200, description: 'Audit statistics retrieved successfully' })
  @Get('stats')
  getAuditStats(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const from = dateFrom ? new Date(dateFrom) : undefined;
    const to = dateTo ? new Date(dateTo) : undefined;
    return this.auditService.getAuditStats(from, to);
  }
}