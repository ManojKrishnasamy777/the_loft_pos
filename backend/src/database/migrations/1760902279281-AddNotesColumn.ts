import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNotesColumn1760902279281 implements MigrationInterface {
    name = 'AddNotesColumn1760902279281'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`notes\` longtext NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`notes\``);
    }

}
