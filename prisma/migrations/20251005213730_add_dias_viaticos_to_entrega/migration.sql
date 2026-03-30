-- AlterTable
ALTER TABLE "entrega" ADD COLUMN     "dias_viaticos" INTEGER,
ADD COLUMN     "fecha_cancelacion" DATE;

-- AlterTable
ALTER TABLE "orden_de_produccion" ADD COLUMN     "estado" VARCHAR(255) NOT NULL DEFAULT 'PENDIENTE';
