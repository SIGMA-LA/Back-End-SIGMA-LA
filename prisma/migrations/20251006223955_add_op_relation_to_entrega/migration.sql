/*
  Warnings:

  - A unique constraint covering the columns `[cod_op]` on the table `entrega` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "sigma_la"."entrega" ADD COLUMN     "cod_op" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "entrega_cod_op_key" ON "sigma_la"."entrega"("cod_op");

-- AddForeignKey
ALTER TABLE "sigma_la"."entrega" ADD CONSTRAINT "entrega_cod_op_fkey" FOREIGN KEY ("cod_op") REFERENCES "sigma_la"."orden_de_produccion"("cod_op") ON DELETE SET NULL ON UPDATE CASCADE;
