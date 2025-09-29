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
import { Category } from './category.entity';
import { OrderItem } from './order-item.entity';

@Entity('menu_items')
export class MenuItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ name: 'category_id' })
  categoryId: string;

  @ManyToOne(() => Category, (category) => category.menuItems)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  image: string;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0.18 })
  taxRate: number;

  @Column({ default: 0 })
  sortOrder: number;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.menuItem)
  orderItems: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}