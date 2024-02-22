import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableColumn } from 'typeorm';

export class AddUsersAndOrganizations1706852747570 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create Users Table
        await queryRunner.createTable(new Table({
            name: 'users',
            columns: [
                { name: 'uuid', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
                { name: 'primary_email', type: 'varchar', isUnique: true },
                { name: 'clerk_id', type: 'varchar', isNullable: false },
                { name: 'signup_date', type: 'timestamp', default: 'now()' },
                { name: 'last_login', type: 'timestamp', isNullable: true },
                { name: 'payment_subscription_id', type: 'varchar', isNullable: true }
            ]
        }));

        // Create Organizations Table
        await queryRunner.createTable(new Table({
            name: 'organizations',
            columns: [
                { name: 'uuid', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
                { name: 'name', type: 'varchar', isNullable: true },
                { name: 'created_date', type: 'timestamp', default: 'now()' }
            ]
        }));

        // Create PricingModels Table
        await queryRunner.createTable(new Table({
            name: 'pricing_models',
            columns: [
                { name: 'uuid', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
                { name: 'created_date', type: 'timestamp', default: 'now()' },
                { name: 'name', type: 'varchar' },
                { name: 'price_per_month', type: 'decimal' },
                { name: 'price_per_year', type: 'decimal' },
                { name: 'max_notifications_per_month', type: 'int' },
                { name: 'overage_cost_per_notification', type: 'decimal' },
                { name: 'notes', type: 'text', isNullable: true },
                { name: 'is_active', type: 'boolean', default: false, isNullable: false }
            ]
        }));

        // Create UserEmails Table for additional emails
        await queryRunner.createTable(new Table({
            name: 'user_emails',
            columns: [
                { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
                { name: 'user_uuid', type: 'uuid' },
                { name: 'email', type: 'varchar', isUnique: true }
            ]
        }));

        // Create UserOrganizations Junction Table
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
            ]
        }));

        // Foreign Key for UserEmails
        await queryRunner.createForeignKey('user_emails', new TableForeignKey({
            columnNames: ['user_uuid'],
            referencedColumnNames: ['uuid'],
            referencedTableName: 'users',
            onDelete: 'CASCADE'
        }));

        // Foreign Key for UserOrganizations
        await queryRunner.createForeignKeys('user_organizations', [
            new TableForeignKey({
                columnNames: ['user_uuid'],
                referencedColumnNames: ['uuid'],
                referencedTableName: 'users',
                onDelete: 'CASCADE'
            }),
            new TableForeignKey({
                columnNames: ['organization_uuid'],
                referencedColumnNames: ['uuid'],
                referencedTableName: 'organizations',
                onDelete: 'CASCADE'
            })
        ]);

        // Foreign Key for Users Pricing Model
        await queryRunner.addColumn('organizations', new TableColumn({
            name: 'pricing_model_uuid',
            type: 'uuid',
            isNullable: true
        }));

        await queryRunner.createForeignKey('organizations', new TableForeignKey({
            columnNames: ['pricing_model_uuid'],
            referencedColumnNames: ['uuid'],
            referencedTableName: 'pricing_models',
            onDelete: 'SET NULL'
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('organizations');
        const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf('pricing_model_uuid') !== -1);
        await queryRunner.dropForeignKey('organizations', foreignKey);
        await queryRunner.dropColumn('organizations', 'pricing_model_uuid');

        // Drop Foreign Keys and Tables in reverse order of creation to avoid dependency issues
        await queryRunner.dropTable('user_organizations');
        await queryRunner.dropTable('user_emails');
        await queryRunner.dropTable('pricing_models');
        await queryRunner.dropTable('organizations');
        await queryRunner.dropTable('users');
    }
}
