import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersTable1753894502748 implements MigrationInterface {
    name = 'CreateUsersTable1753894502748'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`firstName\` varchar(255) NOT NULL, \`lastName\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`role\` enum ('admin', 'user') NOT NULL DEFAULT 'user', \`isVerified\` tinyint NOT NULL DEFAULT 0, \`verifiedAt\` datetime NULL ON UPDATE CURRENT_TIMESTAMP, \`status\` enum ('active', 'inactive', 'deleted', 'banned') NOT NULL DEFAULT 'active', \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`deletedAt\` datetime NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`token\` (\`id\` int NOT NULL AUTO_INCREMENT, \`jti\` varchar(255) NOT NULL, \`userId\` int NOT NULL, \`email\` varchar(255) NOT NULL, \`type\` enum ('refresh', 'resetPassword', 'access', 'verifyEmail', 'verifyResetEmail', 'unsubscribeNewsLetter') NOT NULL, \`expiresAt\` datetime NOT NULL, \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`token\` ADD CONSTRAINT \`FK_82fae97f905930df5d62a702fc9\` FOREIGN KEY (\`id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`token\` DROP FOREIGN KEY \`FK_82fae97f905930df5d62a702fc9\``);
        await queryRunner.query(`DROP TABLE \`token\``);
        await queryRunner.query(`DROP TABLE \`users\``);
    }

}
