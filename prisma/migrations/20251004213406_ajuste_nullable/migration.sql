-- AlterTable
ALTER TABLE "sigma_la"."obra" ALTER COLUMN "nota_fabrica" DROP NOT NULL,
ALTER COLUMN "nota_fabrica_pid" DROP NOT NULL;
ALTER TABLE "sigma_la"."orden_de_produccion" ALTER COLUMN "public_id" DROP NOT NULL;