import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../entities/audit-log.entity';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { AuditFilterDto } from './dto/audit-filter.dto';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async create(createAuditLogDto: CreateAuditLogDto): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create(createAuditLogDto);
    return this.auditLogRepository.save(auditLog);
  }

  async findAll(filterDto?: AuditFilterDto): Promise<{ logs: AuditLog[]; total: number }> {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit')
      .leftJoinAndSelect('audit.user', 'user');

    // Apply filters
    if (filterDto?.userId) {
      queryBuilder.andWhere('audit.userId = :userId', { userId: filterDto.userId });
    }

    if (filterDto?.action) {
      queryBuilder.andWhere('audit.action = :action', { action: filterDto.action });
    }

    if (filterDto?.resource) {
      queryBuilder.andWhere('audit.resource = :resource', { resource: filterDto.resource });
    }

    if (filterDto?.dateFrom && filterDto?.dateTo) {
      queryBuilder.andWhere('audit.timestamp BETWEEN :dateFrom AND :dateTo', {
        dateFrom: new Date(filterDto.dateFrom),
        dateTo: new Date(filterDto.dateTo),
      });
    }

    // Pagination
    const page = filterDto?.page || 1;
    const limit = filterDto?.limit || 50;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy('audit.timestamp', 'DESC');

    const [logs, total] = await queryBuilder.getManyAndCount();

    return { logs, total };
  }

  async logAction(
    userId: string,
    action: string,
    resource: string,
    resourceId?: string,
    oldValues?: any,
    newValues?: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    return this.create({
      userId,
      action,
      resource,
      resourceId,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
    });
  }

  async getAuditStats(dateFrom?: Date, dateTo?: Date) {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit');

    if (dateFrom && dateTo) {
      queryBuilder.where('audit.timestamp BETWEEN :dateFrom AND :dateTo', {
        dateFrom,
        dateTo,
      });
    }

    const [totalLogs, actionStats] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder
        .select('audit.action', 'action')
        .addSelect('COUNT(*)', 'count')
        .groupBy('audit.action')
        .getRawMany(),
    ]);

    const resourceStats = await queryBuilder
      .select('audit.resource', 'resource')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.resource')
      .getRawMany();

    return {
      totalLogs,
      actionStats: actionStats.map(stat => ({
        action: stat.action,
        count: parseInt(stat.count),
      })),
      resourceStats: resourceStats.map(stat => ({
        resource: stat.resource,
        count: parseInt(stat.count),
      })),
    };
  }
}