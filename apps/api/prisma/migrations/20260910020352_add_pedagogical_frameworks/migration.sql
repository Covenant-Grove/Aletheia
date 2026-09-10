-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "pedagogical_frameworks" ADD VALUE 'MONTESSORI';
ALTER TYPE "pedagogical_frameworks" ADD VALUE 'PROJECT_BASED';
ALTER TYPE "pedagogical_frameworks" ADD VALUE 'GUIDED_UNSCHOOLING';
ALTER TYPE "pedagogical_frameworks" ADD VALUE 'ECLECTIC';
