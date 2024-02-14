import { MigrationInterface, QueryRunner, TableForeignKey, TableColumn } from 'typeorm';

export class AddCreatorAndOrgUuidToNotifications1707852508295 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add columns before creating foreign keys
        await queryRunner.addColumn('notifications', new TableColumn({
            name: 'creator_uuid',
            type: 'uuid',
            isNullable: true,
        }));

        await queryRunner.addColumn('notifications', new TableColumn({
            name: 'organization_uuid',
            type: 'uuid',
            isNullable: true,
        }));

        // Create foreign keys with specified names
        await queryRunner.createForeignKey('notifications', new TableForeignKey({
            name: 'fk_notifications_creator_uuid', // Naming the foreign key
            columnNames: ['creator_uuid'],
            referencedColumnNames: ['uuid'],
            referencedTableName: 'users',
            onDelete: 'CASCADE',
        }));

        await queryRunner.createForeignKey('notifications', new TableForeignKey({
            name: 'fk_notifications_organization_uuid', // Naming the foreign key
            columnNames: ['organization_uuid'],
            referencedColumnNames: ['uuid'],
            referencedTableName: 'organizations',
            onDelete: 'CASCADE',
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign keys by the specified names
        await queryRunner.dropForeignKey('notifications', 'fk_notifications_creator_uuid');
        await queryRunner.dropForeignKey('notifications', 'fk_notifications_organization_uuid');

        // Drop columns
        await queryRunner.dropColumn('notifications', 'creator_uuid');
        await queryRunner.dropColumn('notifications', 'organization_uuid');
    }
}
