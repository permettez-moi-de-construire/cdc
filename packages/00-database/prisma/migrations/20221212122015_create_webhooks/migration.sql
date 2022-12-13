-- CreateEnum
CREATE TYPE "cdc"."database_actions" AS ENUM ('insert', 'update', 'delete');

-- CreateTable
CREATE TABLE "cdc"."webhooks" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "url" TEXT NOT NULL,
    "object" TEXT NOT NULL,
    "action" "cdc"."database_actions" NOT NULL,
    "queue" TEXT,
    "consumerTag" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhooks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "webhooks_id_key" ON "cdc"."webhooks"("id");
