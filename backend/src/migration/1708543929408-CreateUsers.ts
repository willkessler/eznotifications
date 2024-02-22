import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from "typeorm";
import { AppDataSource } from "../data-source";

export class CreateUsers1708543929408 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create Users Table
        await queryRunner.createTable(new Table({
            name: 'users',
            columns: [
                { name: 'uuid', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
                { name: 'created_at', type: 'timestamp with time zone', default: 'now()' },
                { name: 'updated_at', type: 'timestamp with time zone', isNullable: true },
                { name: 'last_login_at', type: 'timestamp with time zone', isNullable: true },
                { name: 'primary_email', type: 'varchar', isUnique: true, length: '256' },
                { name: 'clerk_id', type: 'varchar', isUnique: true, isNullable: false, length: '256' },
                { name: 'payment_subscription_id', type: 'varchar', isNullable: true, length: '256' },
                { name: 'is_banned', type: 'boolean', isNullable: true },
            ]
        }));

        await queryRunner.query(`
        CREATE INDEX "IDX_users_clerk_id" ON public.users USING btree ("clerk_id");
        `);

        await queryRunner.query(`
        CREATE INDEX "IDX_users_primary_email" ON public.users USING btree ("primary_email");
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
           DROP INDEX IF EXISTS public."IDX_users_primary_email";
        `);

        await queryRunner.query(`
           DROP INDEX IF EXISTS public."IDX_users_clerk_id";
        `);

        await queryRunner.query(`
           DROP TABLE IF EXISTS public.users;
        `);
    }
}

