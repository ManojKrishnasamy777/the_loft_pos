import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('email_config')
export class EmailConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, default: 'smtp.gmail.com' })
  smtpHost: string;

  @Column({ type: 'int', default: 587 })
  smtpPort: number;

  @Column({ type: 'varchar', length: 255 })
  smtpUser: string;

  @Column({ type: 'varchar', length: 255 })
  smtpPassword: string;

  @Column({ type: 'varchar', length: 255 })
  fromEmail: string;

  @Column({ type: 'varchar', length: 255, default: 'Restaurant POS' })
  fromName: string;

  @Column({ type: 'text', nullable: true })
  logoUrl: string;

  @Column({ type: 'boolean', default: false })
  isEnabled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  userId: string;
}
