import { MigrationInterface, QueryRunner, TableForeignKey } from "typeorm";

export class AddNotificationsFKToEndUsersServed1706238406079 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const foreignKey = new TableForeignKey({
            name: 'fk_end_users_served_to_notifications',
            columnNames: ['notification_id'], // The column in endUsersServed
            referencedColumnNames: ['id'], // The primary key in notifications
            referencedTableName: 'notifications',
            onDelete: 'CASCADE', // Optional: CASCADE, SET NULL, NO ACTION, etc.
        });

        await queryRunner.createForeignKey('end_users_served', foreignKey);
        
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey('end_users_served', 'fk_end_users_served_to_notifications');
    }

}
