import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class RenameOrgCreatedAtField1707540952591 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.renameColumn(
            'organizations',
            'created_date',
            'created_at');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.renameColumn(
            'organizations',
            'created_at',
            'created_date');
    }

}
