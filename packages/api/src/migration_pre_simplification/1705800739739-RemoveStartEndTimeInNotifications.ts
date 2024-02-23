import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class RemoveStartEndTimeInNotifications1705800739739 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(
        'notifications',
        'start_time'
    );
    await queryRunner.dropColumn(
        'notifications',
        'end_time'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'notifications',
      new TableColumn({
        name: 'start_time',
        type: 'timestamp with time zone',
        isNullable: true,
      })
    );
    await queryRunner.addColumn(
      'notifications',
      new TableColumn({
        name: 'end_time',
        type: 'timestamp with time zone',
        isNullable: true,
      })
    );
  }

}
