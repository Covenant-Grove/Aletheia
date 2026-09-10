-- AlterTable: users gains a real platform-admin flag (issue #101), safe
-- default false -- every existing row is unaffected.
ALTER TABLE "users" ADD COLUMN "is_platform_admin" BOOLEAN NOT NULL DEFAULT false;
