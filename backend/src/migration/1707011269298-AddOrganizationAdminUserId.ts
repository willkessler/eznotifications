import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddOrganizationAdminUserId1707011269298 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'user_organizations',
            new TableColumn({
                name: 'role',
                type: 'enum',
                enum: ['Admin', 'Member', 'Guest'],
                default: "'Member'",
                isNullable: false,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('user_organizations', 'role');
    }
}
