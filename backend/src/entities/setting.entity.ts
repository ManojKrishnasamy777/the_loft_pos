import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('settings')
export class Setting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  key: string;

  @Column({ type: 'text' })
  value: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}