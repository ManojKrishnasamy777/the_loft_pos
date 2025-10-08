import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePrinterConfig1696750000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE printer_config (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                type ENUM('EPSON','STAR','GENERIC') DEFAULT 'EPSON',
                interface_type ENUM('USB','NETWORK') DEFAULT 'USB',
                usb_identifier VARCHAR(255),
                network_ip VARCHAR(50),
                network_port INT DEFAULT 9100,
                is_default BOOLEAN DEFAULT TRUE,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE printer_config`);
    }
}
