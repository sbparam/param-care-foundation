import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEventsTable1753475797399 implements MigrationInterface {
    name = 'CreateEventsTable1753475797399'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`events\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`date\` datetime NOT NULL, \`event_starting_time\` time NOT NULL, \`event_finishing_time\` time NOT NULL, \`location\` varchar(255) NOT NULL, \`attendees\` varchar(255) NOT NULL, \`images\` text NOT NULL, \`description\` varchar(255) NOT NULL, \`slug\` varchar(255) NOT NULL, \`status\` enum ('active', 'inactive', 'deleted') NOT NULL DEFAULT 'active', \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`deletedAt\` datetime NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`contact_us\` (\`id\` int NOT NULL AUTO_INCREMENT, \`fullName\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`subject\` varchar(255) NOT NULL, \`phoneNumber\` varchar(255) NOT NULL, \`message\` varchar(255) NOT NULL, \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`deletedAt\` datetime NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`blogs\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`author\` varchar(255) NOT NULL, \`mins_read\` varchar(255) NOT NULL, \`image\` varchar(255) NOT NULL, \`description\` varchar(255) NOT NULL, \`slug\` varchar(255) NOT NULL, \`status\` enum ('active', 'inactive', 'deleted') NOT NULL DEFAULT 'active', \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`deletedAt\` datetime NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`blogs\``);
        await queryRunner.query(`DROP TABLE \`contact_us\``);
        await queryRunner.query(`DROP TABLE \`events\``);
    }

}
