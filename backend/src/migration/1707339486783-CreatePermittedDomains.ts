import { MigrationInterface, QueryRunner, Table, TableColumn, TableIndex, TableForeignKey } from "typeorm";

export class CreatePermittedDomains1707339486783 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'permitted_domains',
            columns: [
                { 
                    name: 'uuid', 
                    type: 'uuid', 
                    isPrimary: true, 
                    default: 'uuid_generate_v4()' 
                },
                {
                    name: 'created_at',
                    type: 'timestamp',
                    isNullable: false,
                    default: 'NOW()'
                },
                { 
                    name: 'domain', 
                    type: 'text',
                    isNullable: false,
                },
            ],
        }));

        // Add FK to user who is the creator
        await queryRunner.addColumn('permitted_domains', new TableColumn({
            name: 'creator_uuid',
            type: 'uuid',
            isNullable: false,
        }));

        await queryRunner.createForeignKey('permitted_domains', new TableForeignKey({
            columnNames: ['creator_uuid'],
            referencedTableName: 'users',
            referencedColumnNames: ['uuid'],
            onDelete: 'SET NULL'
        }));

        // Add FK to organization who owns it
        await queryRunner.addColumn('permitted_domains', new TableColumn({
            name: 'organization_uuid',
            type: 'uuid',
            isNullable: false,
        }));

        await queryRunner.createForeignKey('permitted_domains', new TableForeignKey({
            columnNames: ['organization_uuid'],
            referencedTableName: 'organizations',
            referencedColumnNames: ['uuid'],
            onDelete: 'SET NULL'
        }));

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table1 = await queryRunner.getTable('organizations');
        const foreignKey1 = table1.foreignKeys.find(fk => fk.columnNames.indexOf('organization_uuid') !== -1);
        await queryRunner.dropForeignKey('permitted_domains', foreignKey1);
        await queryRunner.dropColumn('permitted_domains', 'organization_uuid');

        const table2 = await queryRunner.getTable('users');
        const foreignKey2 = table1.foreignKeys.find(fk => fk.columnNames.indexOf('creator_uuid') !== -1);
        await queryRunner.dropForeignKey('permitted_domains', foreignKey2);
        await queryRunner.dropColumn('permitted_domains', 'creator_uuid');
        
        await queryRunner.dropTable('permitted_domains');
    }

}
