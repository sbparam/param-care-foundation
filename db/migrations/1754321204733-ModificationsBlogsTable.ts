import { MigrationInterface, QueryRunner } from "typeorm";

export class ModificationsBlogsTable1754321204733 implements MigrationInterface {
    name = 'ModificationsBlogsTable1754321204733'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`blogs\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`blogs\` ADD \`description\` longtext NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`blogs\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`blogs\` ADD \`description\` varchar(255) NOT NULL`);
    }

}
