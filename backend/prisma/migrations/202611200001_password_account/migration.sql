CREATE TABLE "app"."password_account" (
  "id" UUID NOT NULL,
  "email" VARCHAR(254) NOT NULL,
  "password_hash" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "password_account_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "password_account_email_key" ON "app"."password_account"("email");
