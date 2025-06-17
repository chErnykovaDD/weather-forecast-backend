import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1750201725857 implements MigrationInterface {
    name = 'Init1750201725857'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."Subscription_frequency_enum" AS ENUM('daily', 'hourly')`);
        await queryRunner.query(`CREATE TABLE "Subscription" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "email" character varying NOT NULL, "city" character varying NOT NULL, "frequency" "public"."Subscription_frequency_enum" NOT NULL DEFAULT 'hourly', "confirmed" boolean NOT NULL DEFAULT false, "confirmationToken" character varying NOT NULL, "unsubscribeToken" character varying, CONSTRAINT "UQ_a5826de4d21cf3de58efdc48b3c" UNIQUE ("email", "city"), CONSTRAINT "PK_eb0d69496fa84cd24da9fc78edd" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "Subscription"`);
        await queryRunner.query(`DROP TYPE "public"."Subscription_frequency_enum"`);
    }

}
