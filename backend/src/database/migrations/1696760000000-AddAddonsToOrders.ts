import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddAddonsToOrders1696760000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('orders');

    if (table) {
      const addonsColumn = table.findColumnByName('addons');
      if (!addonsColumn) {
        await queryRunner.addColumn(
          'orders',
          new TableColumn({
            name: 'addons',
            type: 'json',
            isNullable: true,
          }),
        );
      }

      const addonsTotalColumn = table.findColumnByName('addonsTotal');
      if (!addonsTotalColumn) {
        await queryRunner.addColumn(
          'orders',
          new TableColumn({
            name: 'addonsTotal',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          }),
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('orders');

    if (table) {
      const addonsColumn = table.findColumnByName('addons');
      if (addonsColumn) {
        await queryRunner.dropColumn('orders', 'addons');
      }

      const addonsTotalColumn = table.findColumnByName('addonsTotal');
      if (addonsTotalColumn) {
        await queryRunner.dropColumn('orders', 'addonsTotal');
      }
    }
  }
}
