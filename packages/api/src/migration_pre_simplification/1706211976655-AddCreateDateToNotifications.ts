import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";
import { AppDataSource } from "../data-source";

export class AddCreateDateToNotifications1706211976655 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'notifications',
            new TableColumn({
                name: 'created_at',
                type: 'timestamp',
                isNullable: false,
                default: 'NOW()'
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('notifications', 'created_at');
    }

}
