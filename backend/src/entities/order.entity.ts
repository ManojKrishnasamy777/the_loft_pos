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
import { User } from './user.entity';
import { Customer } from './customer.entity';
import { OrderItem } from './order-item.entity';
import { Payment } from './payment.entity';
import { PaymentMethod } from '../Enum/paymentmethodEnum';
import { Screens } from './screens.entity';

export enum OrderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}



@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  orderNumber: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  addonsTotal: number;

  @Column({ type: 'json', nullable: true })
  addons: any;

  @Column({ nullable: true, length: 150 })
  customerEmail: string;

  @Column({ nullable: true, length: 100 })
  customerName: string;

  @Column({ nullable: true, length: 15 })
  customerPhone: string;

  @Column({ name: 'customer_id', nullable: true })
  customerId: string;

  @ManyToOne(() => Customer, (customer) => customer.orders, { nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ name: 'screen_id', nullable: true })
  screenId: string;

  @ManyToOne(() => Screens, { nullable: true })
  @JoinColumn({ name: 'screen_id' })
  screen: Screens;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.CASH,
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ name: 'created_by' })
  createdById: string;

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: true,
  })
  items: OrderItem[];

  @OneToMany(() => Payment, (payment) => payment.order)
  payments: Payment[];

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @Column({ type: 'longtext', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}