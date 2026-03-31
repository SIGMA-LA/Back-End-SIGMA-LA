-- AlterTable: agregar columna esFinal a entrega con default false
ALTER TABLE "entrega" ADD COLUMN "esFinal" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: agregar columna cod_entrega a orden_de_produccion (FK nullable)
ALTER TABLE "orden_de_produccion" ADD COLUMN "cod_entrega" INTEGER;

-- DropIndex: eliminar el unique constraint de cod_op en entrega (relacion 1-a-1 anterior)
DROP INDEX IF EXISTS "entrega_cod_op_key";

-- AlterTable: eliminar la columna cod_op de entrega (la FK estaba del lado de entrega antes)
ALTER TABLE "entrega" DROP COLUMN IF EXISTS "cod_op";

-- AddForeignKey: orden_de_produccion -> entrega (N OP a 1 entrega)
ALTER TABLE "orden_de_produccion" ADD CONSTRAINT "orden_de_produccion_cod_entrega_fkey" FOREIGN KEY ("cod_entrega") REFERENCES "entrega"("cod_entrega") ON DELETE SET NULL ON UPDATE CASCADE;
