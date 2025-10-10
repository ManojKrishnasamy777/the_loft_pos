import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('printer_config')
export class PrinterConfig {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'enum', enum: ['EPSON', 'STAR', 'GENERIC'], default: 'EPSON' })
    type: 'EPSON' | 'STAR' | 'GENERIC';

    @Column({ type: 'enum', enum: ['USB', 'NETWORK'], default: 'USB' })
    interface_type: 'USB' | 'NETWORK';

    @Column({ type: 'varchar', length: 255, nullable: true })
    usb_identifier: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    product_id: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    vendor_id: string | null;

    @Column({ type: 'varchar', length: 50, nullable: true })
    network_ip: string | null;

    @Column({ type: 'int', default: 9100 })
    network_port: number;

    @Column({ type: 'boolean', default: true })
    is_default: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
