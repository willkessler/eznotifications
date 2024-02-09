import { MigrationInterface, QueryRunner, Table, TableColumn, TableIndex, TableForeignKey } from "typeorm";

export class CreateAPITokens1707339476786 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'api_keys',
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
                    name: 'api_key',
                    type: 'text',
                    isNullable: true,
                },
                {
                    name: 'api_key_type',
                    type: 'enum',
                    enum: ['development', 'production'],
                    default: "'development'",
                    isNullable: false,
                },
                {
                    name: 'is_active',
                    type: 'boolean',
                    default: true
                },
            ],
        }));

        // Add FK to user who is the creator
        await queryRunner.addColumn('api_keys', new TableColumn({
            name: 'creator_uuid',
            type: 'uuid',
            isNullable: false
        }));

        await queryRunner.createForeignKey('api_keys', new TableForeignKey({
            columnNames: ['creator_uuid'],
            referencedTableName: 'users',
            referencedColumnNames: ['uuid'],
            onDelete: 'SET NULL'
        }));

        // Add FK to organization who owns it
        await queryRunner.addColumn('api_keys', new TableColumn({
            name: 'organization_uuid',
            type: 'uuid',
            isNullable: false
        }));

        await queryRunner.createForeignKey('api_keys', new TableForeignKey({
            columnNames: ['organization_uuid'],
            referencedTableName: 'organizations',
            referencedColumnNames: ['uuid'],
            onDelete: 'SET NULL'
        }));

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table1 = await queryRunner.getTable('organizations');
        const foreignKey1 = table1.foreignKeys.find(fk => fk.columnNames.indexOf('organization_uuid') !== -1);
        await queryRunner.dropForeignKey('api_keys', foreignKey1);
        await queryRunner.dropColumn('api_keys', 'organization_uuid');

        const table2 = await queryRunner.getTable('users');
        const foreignKey2 = table1.foreignKeys.find(fk => fk.columnNames.indexOf('creator_uuid') !== -1);
        await queryRunner.dropForeignKey('api_keys', foreignKey2);
        await queryRunner.dropColumn('api_keys', 'creator_uuid');

        await queryRunner.dropTable('api_keys');
    }

}
