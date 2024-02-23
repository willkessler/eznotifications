import { MigrationInterface, QueryRunner, Table } from "typeorm";
import { AppDataSource } from "../data-source";

export class CreateNotificationTable1630245788256 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'notifications',
            columns: [
                { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
                { name: 'content', type: 'text' },
                { name: 'scheduled', type: 'boolean', default: false },
                { name: 'start_time', type: 'timestamp with time zone', isNullable: true },
                { name: 'end_time', type: 'timestamp with time zone', isNullable: true },
                { name: 'canceled', type: 'boolean', default: false },
                { name: 'page_id', type: 'text' },
            ],
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "notification"`);
    }
}
