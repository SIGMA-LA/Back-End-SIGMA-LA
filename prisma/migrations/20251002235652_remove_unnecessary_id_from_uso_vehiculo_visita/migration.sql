/*
  Warnings:

  - The primary key for the `uso_vehiculo_visita` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `cod_uso_vehiculo_visita` on the `uso_vehiculo_visita` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "sigma_la"."uso_vehiculo_visita_patente_fecha_hora_ini_uso_key";

-- AlterTable
ALTER TABLE "sigma_la"."uso_vehiculo_visita" DROP CONSTRAINT "uso_vehiculo_visita_pkey",
DROP COLUMN "cod_uso_vehiculo_visita",
ADD CONSTRAINT "uso_vehiculo_visita_pkey" PRIMARY KEY ("patente", "cod_visita");
