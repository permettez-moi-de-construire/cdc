-- CreateTable
CREATE TABLE "bears" (
    "id" TEXT NOT NULL,
    "nick_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bears_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bears_id_key" ON "bears"("id");

-- ReplicaIdentity
ALTER TABLE "bears" REPLICA IDENTITY FULL;
