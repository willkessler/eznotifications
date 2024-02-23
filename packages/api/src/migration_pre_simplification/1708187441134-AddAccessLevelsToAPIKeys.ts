import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddAccessLevelsToAPIKeys1708187441134 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'api_keys',
            new TableColumn({
                name: 'access_level',
                type: 'enum',
                enum: ['frontend_only', 'backend_only', 'all'],
                default: "'all'",
                isNullable: false
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('api_keys', 'access_level');
    }

}
