import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTables1784301222305 implements MigrationInterface {
  name = 'CreateTables1784301222305';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create ENUM types first
    await queryRunner.query(
      `CREATE TYPE "public"."properties_type_enum" AS ENUM('HOTEL', 'VILLA', 'APARTMENT', 'GUEST_HOUSE')`,
    );
    await queryRunner.query(`CREATE TYPE "public"."coupons_type_enum" AS ENUM('PERCENT', 'FIXED')`);
    await queryRunner.query(
      `CREATE TYPE "public"."bookings_status_enum" AS ENUM('PENDING', 'PAID', 'CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."booking_status_histories_from_status_enum" AS ENUM('PENDING', 'PAID', 'CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."booking_status_histories_to_status_enum" AS ENUM('PENDING', 'PAID', 'CANCELLED')`,
    );

    // Create properties table
    await queryRunner.query(
      `CREATE TABLE "properties" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(200) NOT NULL, "city" character varying(100) NOT NULL, "address" text NOT NULL, "type" "public"."properties_type_enum" NOT NULL, "rating" numeric(3,2) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2d83bfa0b9fcd45dee1785af44d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4539105bbf1089777a25e4be80" ON "properties" ("rating") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_19b9270d8423dea60f4d86088b" ON "properties" ("city", "type") `,
    );

    // Create rooms table (depends on properties)
    await queryRunner.query(
      `CREATE TABLE "rooms" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "property_id" uuid NOT NULL, "name" character varying(200) NOT NULL, "capacity" integer NOT NULL, "price_per_night" numeric(15,2) NOT NULL, "total_unit" integer NOT NULL, "available_unit" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0368a2d7c215f2d0458a54933f2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5653eff5b30c7eb55445c87026" ON "rooms" ("capacity") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_73ce948aca12565c5b9136cb71" ON "rooms" ("price_per_night") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f3a3e21cdec3d9f8069edf6f52" ON "rooms" ("property_id") `,
    );

    // Create coupons table
    await queryRunner.query(
      `CREATE TABLE "coupons" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying(30) NOT NULL, "type" "public"."coupons_type_enum" NOT NULL, "discount_value" numeric(15,2) NOT NULL, "max_discount" numeric(15,2), "min_transaction" numeric(15,2) NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "valid_until" date, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e025109230e82925843f2a14c48" UNIQUE ("code"), CONSTRAINT "PK_d7ea8864a0150183770f3e9a8cb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_e025109230e82925843f2a14c4" ON "coupons" ("code") `,
    );

    // Create bookings table (depends on rooms and coupons)
    await queryRunner.query(
      `CREATE TABLE "bookings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "booking_code" character varying(30) NOT NULL, "room_id" uuid NOT NULL, "coupon_id" uuid, "customer_name" character varying(100) NOT NULL, "customer_email" character varying(150) NOT NULL, "check_in_date" date NOT NULL, "check_out_date" date NOT NULL, "total_nights" integer NOT NULL, "subtotal" numeric(15,2) NOT NULL, "automatic_discount" numeric(15,2) NOT NULL DEFAULT '0', "coupon_discount" numeric(15,2) NOT NULL DEFAULT '0', "final_price" numeric(15,2) NOT NULL, "status" "public"."bookings_status_enum" NOT NULL DEFAULT 'PENDING', "paid_at" TIMESTAMP, "cancelled_at" TIMESTAMP, "expired_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_796e0227e4beff186bdd72ac53b" UNIQUE ("booking_code"), CONSTRAINT "PK_bee6805982cc1e248e94ce94957" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_51cfaf6f40ddf13d9435554936" ON "bookings" ("status", "expired_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b8ca4fb605f5492daaf82cbffd" ON "bookings" ("customer_email") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0e5f556039f9b4c716771cf82e" ON "bookings" ("room_id", "status") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_796e0227e4beff186bdd72ac53" ON "bookings" ("booking_code") `,
    );

    // Create booking_status_histories table (depends on bookings)
    await queryRunner.query(
      `CREATE TABLE "booking_status_histories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "booking_id" uuid NOT NULL, "from_status" "public"."booking_status_histories_from_status_enum" NOT NULL, "to_status" "public"."booking_status_histories_to_status_enum" NOT NULL, "note" text, "changed_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cf024125193d381e989bfefa3de" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_746998f688d207c9cf08b9feed" ON "booking_status_histories" ("booking_id") `,
    );

    // Add foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "rooms" ADD CONSTRAINT "FK_f3a3e21cdec3d9f8069edf6f52f" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking_status_histories" ADD CONSTRAINT "FK_746998f688d207c9cf08b9feedd" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD CONSTRAINT "FK_0b0fc32fe6bd0119e281628df7a" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD CONSTRAINT "FK_23ec6943dfbd6fb667f629e990b" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP CONSTRAINT "FK_23ec6943dfbd6fb667f629e990b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP CONSTRAINT "FK_0b0fc32fe6bd0119e281628df7a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking_status_histories" DROP CONSTRAINT "FK_746998f688d207c9cf08b9feedd"`,
    );
    await queryRunner.query(`ALTER TABLE "rooms" DROP CONSTRAINT "FK_f3a3e21cdec3d9f8069edf6f52f"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_746998f688d207c9cf08b9feed"`);
    await queryRunner.query(`DROP TABLE "booking_status_histories"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_796e0227e4beff186bdd72ac53"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_0e5f556039f9b4c716771cf82e"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_b8ca4fb605f5492daaf82cbffd"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_51cfaf6f40ddf13d9435554936"`);
    await queryRunner.query(`DROP TABLE "bookings"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_e025109230e82925843f2a14c4"`);
    await queryRunner.query(`DROP TABLE "coupons"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_f3a3e21cdec3d9f8069edf6f52"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_73ce948aca12565c5b9136cb71"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_5653eff5b30c7eb55445c87026"`);
    await queryRunner.query(`DROP TABLE "rooms"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_19b9270d8423dea60f4d86088b"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_4539105bbf1089777a25e4be80"`);
    await queryRunner.query(`DROP TABLE "properties"`);

    // Drop ENUM types
    await queryRunner.query(`DROP TYPE "public"."booking_status_histories_to_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."booking_status_histories_from_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."bookings_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."coupons_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."properties_type_enum"`);
  }
}
