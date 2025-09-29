import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Role } from './role.entity';
import { Order } from './order.entity';
import { AuditLog } from './audit-log.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true, length: 150 })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ name: 'role_id' })
  roleId: string;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @OneToMany(() => Order, (order) => order.createdBy)
  orders: Order[];

  @OneToMany(() => AuditLog, (auditLog) => auditLog.user)
  auditLogs: AuditLog[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}