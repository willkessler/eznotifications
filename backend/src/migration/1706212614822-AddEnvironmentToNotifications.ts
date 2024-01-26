import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";
import { AppDataSource } from "../data-source";

export class AddEnvironmentToNotifications1706212614822 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'notifications',
            new TableColumn({
                name: 'environment',
                type: 'varchar',
                length: '256',
                isNullable: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('notifications', 'environment');
    }

}
