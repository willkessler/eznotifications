import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class RenameEnvironmentsField1706503138046 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.renameColumn(
            'notifications',
            'environment',
            'environments');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.renameColumn(
            'notifications',
            'environments',
            'environment');
    }

}
