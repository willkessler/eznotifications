import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddCreatedAtToUserOrganization1708023172810 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'user_organizations',
            new TableColumn({
                name: 'created_at',
                type: 'timestamp',
                isNullable: false,
                default: 'NOW()'
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('user_organizations', 'created_at') ;
   }

}
