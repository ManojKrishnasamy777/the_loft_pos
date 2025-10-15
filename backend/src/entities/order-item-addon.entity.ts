import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { OrderItem } from './order-item.entity';
import { Addon } from './addon.entity';

@Entity('order_item_addons')
export class OrderItemAddon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_item_id' })
  orderItemId: string;

  @ManyToOne(() => OrderItem)
  @JoinColumn({ name: 'order_item_id' })
  orderItem: OrderItem;

  @Column({ name: 'addon_id' })
  addonId: string;

  @ManyToOne(() => Addon)
  @JoinColumn({ name: 'addon_id' })
  addon: Addon;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @CreateDateColumn()
  createdAt: Date;
}
