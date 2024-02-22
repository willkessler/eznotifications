import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class RenameScheduledandCanceledFields1706307279918 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.renameColumn(
            'notifications',
            'canceled',
            'live');

        await queryRunner.dropColumn(
            'notifications',
            'scheduled');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'notifications',
            new TableColumn({
                name: 'scheduled',
                type: 'boolean',
                isNullable: true,
            }));
        await queryRunner.renameColumn(
            'notifications',
            'live',
            'canceled');
    }
}
