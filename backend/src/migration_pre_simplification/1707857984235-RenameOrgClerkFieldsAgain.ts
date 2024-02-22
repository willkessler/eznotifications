import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class RenameOrgClerkFieldsAgain1707857984235 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.renameColumn(
            'organizations',
            'organization_clerk_id',
            'clerk_organization_id');

        await queryRunner.renameColumn(
            'organizations',
            'creator_clerk_id',
            'clerk_creator_id');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.renameColumn(
            'organizations',
            'clerk_id',
            'clerk_organization_id');
        await queryRunner.renameColumn(
            'organizations',
            'clerk_creator_id',
            'creator_clerk_id');
    }

}
