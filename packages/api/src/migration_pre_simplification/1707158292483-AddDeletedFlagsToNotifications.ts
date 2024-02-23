import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from "typeorm";

export class AddDeletedFlagsToNotifications1707158292483 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'notifications',
            new TableColumn({
                name: 'deleted',
                type: 'boolean',
                default: false,
            })
        );
        await queryRunner.addColumn(
            'notifications',
            new TableColumn({
                name: 'deleted_at',
                type: 'timestamp with time zone',
                isNullable: true,
            })
        );
        await queryRunner.createIndex(
            'notifications',
            new TableIndex({
                name: 'idx_notifications_deleted',
                columnNames: ['deleted'],
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex('notifications', 'idx_notifications_deleted');
        await queryRunner.dropColumn('notifications', 'deleted_at');
        await queryRunner.dropColumn('notifications', 'deleted');
    }

}
