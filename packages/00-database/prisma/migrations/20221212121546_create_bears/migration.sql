-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "cdc";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "operational";

-- CreateTable
CREATE TABLE "operational"."bears" (
    "id" TEXT NOT NULL,
    "nick_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bears_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bears_id_key" ON "operational"."bears"("id");

-- ReplicaIdentity
ALTER TABLE "operational"."bears" REPLICA IDENTITY FULL;
