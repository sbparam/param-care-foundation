import { MigrationInterface, QueryRunner } from "typeorm";

export class ModificationBlogTable1756416031164 implements MigrationInterface {
    name = 'ModificationBlogTable1756416031164'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`blogs\` DROP COLUMN \`image\``);
        await queryRunner.query(`ALTER TABLE \`blogs\` ADD \`image\` longtext NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`blogs\` DROP COLUMN \`image\``);
        await queryRunner.query(`ALTER TABLE \`blogs\` ADD \`image\` varchar(255) NOT NULL`);
    }

}
