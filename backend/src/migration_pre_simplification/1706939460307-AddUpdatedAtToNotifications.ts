import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddUpdatedAtToNotifications1706939460307 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'notifications',
            new TableColumn({
                name: 'updated_at',
                type: 'timestamp',
                isNullable: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('notifications', 'updated_at');
    }

}
