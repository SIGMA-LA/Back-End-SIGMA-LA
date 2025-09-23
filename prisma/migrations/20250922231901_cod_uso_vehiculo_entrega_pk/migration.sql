/*
  Warnings:

  - The primary key for the `uso_vehiculo_entrega` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[patente,fecha_hora_ini_uso]` on the table `uso_vehiculo_entrega` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "sigma_la"."uso_vehiculo_entrega" DROP CONSTRAINT "uso_vehiculo_entrega_pkey",
ADD COLUMN     "cod_uso_vehiculo_entrega" SERIAL NOT NULL,
ADD CONSTRAINT "uso_vehiculo_entrega_pkey" PRIMARY KEY ("cod_uso_vehiculo_entrega");

-- CreateIndex
CREATE UNIQUE INDEX "uso_vehiculo_entrega_patente_fecha_hora_ini_uso_key" ON "sigma_la"."uso_vehiculo_entrega"("patente", "fecha_hora_ini_uso");
