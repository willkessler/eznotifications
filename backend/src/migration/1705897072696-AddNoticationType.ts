import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddNoticationType1705897072696 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'notifications',
            new TableColumn({
                name: 'notification_type',
                type: 'text',
                isNullable: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('notifications', 'notification_type');
    }

}
