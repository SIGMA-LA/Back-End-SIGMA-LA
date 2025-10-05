-- AlterTable
ALTER TABLE "sigma_la"."entrega" ADD COLUMN     "dias_viaticos" INTEGER,
ADD COLUMN     "fecha_cancelacion" DATE;

-- AlterTable
ALTER TABLE "sigma_la"."orden_de_produccion" ADD COLUMN     "estado" VARCHAR(255) NOT NULL DEFAULT 'PENDIENTE';
