import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class RenameOrganizationClerkId1707856416703 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.renameColumn(
            'organizations',
            'clerk_id',
            'organization_clerk_id');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.renameColumn(
            'organizations',
            'organization_clerk_id',
            'clerk_id');
    }

}
