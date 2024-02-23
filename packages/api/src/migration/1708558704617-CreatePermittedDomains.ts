import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreatePermittedDomains1708558704617 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'permitted_domains',
            columns: [
                { name: 'uuid', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
                { name: 'created_at', type: 'timestamp with time zone', default: 'now()' },
                { name: 'domain', type: 'text' },
                { name: 'creator_uuid', type: 'uuid' },
                { name: 'organization_uuid', type: 'uuid' },
            ],
            foreignKeys: [
                {
                    columnNames: ['organization_uuid'],
                    referencedTableName: 'organizations',
                    referencedColumnNames: ['uuid'],
                    onDelete: 'SET NULL',
                    name: 'FK_permitted_domains_organization_uuid',
                },
                {
                    columnNames: ['creator_uuid'],
                    referencedTableName: 'users',
                    referencedColumnNames: ['uuid'],
                    onDelete: 'SET NULL',
                    name: 'FK_permitted_domains_creator_uuid',
                },
            ],
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('permitted_domains');
    }
}
