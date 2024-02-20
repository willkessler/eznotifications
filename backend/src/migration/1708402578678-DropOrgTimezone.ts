import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class DropOrgTimezone1708402578678 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('organizations', 'preferred_timezone');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'organizations',
            new TableColumn({
                name: 'preferred_timezone',
                type: 'varchar',
                length: '256',
                isNullable: true,
            })
        );
    }

}
