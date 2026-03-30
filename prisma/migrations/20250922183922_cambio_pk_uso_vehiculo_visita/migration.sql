/*
  Warnings:

  - The primary key for the `uso_vehiculo_visita` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[patente,fecha_hora_ini_uso]` on the table `uso_vehiculo_visita` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "sigma_la"."uso_vehiculo_visita" DROP CONSTRAINT "uso_vehiculo_visita_pkey",
ADD COLUMN     "cod_uso_vehiculo_visita" SERIAL NOT NULL,
ADD CONSTRAINT "uso_vehiculo_visita_pkey" PRIMARY KEY ("cod_uso_vehiculo_visita");

-- CreateIndex
CREATE UNIQUE INDEX "uso_vehiculo_visita_patente_fecha_hora_ini_uso_key" ON "sigma_la"."uso_vehiculo_visita"("patente", "fecha_hora_ini_uso");
