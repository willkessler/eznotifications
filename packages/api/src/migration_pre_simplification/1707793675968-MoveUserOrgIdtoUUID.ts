import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class MoveUserOrgIdtoUUID1707793675968 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop the existing table
        await queryRunner.dropTable('user_organizations');

        // Recreate the table with a UUID primary key
        await queryRunner.createTable(new Table({
            name: 'user_organizations',
            columns: [
                {
                    name: 'uuid',
                    type: 'uuid',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'uuid',
                    default: `uuid_generate_v4()`,
                },
                { name: 'user_uuid', type: 'uuid' },
                { name: 'organization_uuid', type: 'uuid' },
            ],
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('user_organizations');

        // Recreate the original table structure
        await queryRunner.createTable(new Table({
            name: 'user_organizations',
            columns: [
                { name: 'user_uuid', type: 'uuid' },
                { name: 'organization_uuid', type: 'uuid' },
                {
                    name: 'id',
                    type: 'int',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment'
                },
            ],
        }));
    }

}
