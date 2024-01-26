import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from "typeorm";
import { AppDataSource } from "../data-source";

export class AddEndUsersTable1706209214969 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'end_users',
            columns: [
                { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
                // when this end user record was created
                { name: 'created_at', type: 'timestamp', default: 'NOW()', isNullable: false },
                // whatever id was provided by our customer for this end user
                { name: 'end_user_id', type: 'varchar', length: '256', isNullable: false}
            ]
        }));

        await queryRunner.createTable(new Table({
            name: 'end_users_served',
            columns: [
                { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
                // when this end user record was created
                { name: 'created_at', type: 'timestamp', default: 'NOW()', isNullable: false },
                // which notification was served to this user
                { name: 'notification_id', type: 'uuid', isNullable: false},
                // when this user was last provided this notification
                { name: 'access_time', type: 'timestamp with time zone', isNullable: false },
                // FK to an end_user record containing the customer's provided end_user id
                { name: 'end_user_id', type: 'uuid', isNullable: false},
                // whether or not this user should be ignored when filtering notifs by access time; usually used by test users in prod
                { name: 'ignored', type: 'boolean', default: false }
            ],
            foreignKeys: [
                new TableForeignKey({
                    name: 'fk_end_users_served_to_end_users',
                    columnNames: ['end_user_id'],
                    referencedTableName: 'end_users',
                    referencedColumnNames: ['id'],
                    onDelete: 'CASCADE'
                })
            ]
        }));

        await queryRunner.createIndex('end_users_served', new TableIndex({
            name: 'idx_end_users_served_by_access_time',
            columnNames: ['end_user_id', 'access_time']
        }));
    };

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex('end_users_served', 'idx_end_users_served_by_access_time');
        await queryRunner.dropForeignKey('end_users_served', 'fk_end_users_served_to_end_users');
        await queryRunner.query(`DROP TABLE "end_users_served"`);
        await queryRunner.query(`DROP TABLE "end_users"`);
    }
}
