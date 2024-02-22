import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddStartEndDateToNotifications1705785029713 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'notifications',
      new TableColumn({
        name: 'start_date',
        type: 'timestamp with time zone',
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      'notifications',
      new TableColumn({
        name: 'end_date',
        type: 'timestamp with time zone',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('notifications', 'start_date');
    await queryRunner.dropColumn('notifications', 'end_date');
  }
}
