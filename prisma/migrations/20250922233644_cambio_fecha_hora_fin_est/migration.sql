/*
  Warnings:

  - You are about to drop the column `fecha_hora_ini_est` on the `uso_vehiculo_entrega` table. All the data in the column will be lost.
  - Added the required column `fecha_hora_fin_est` to the `uso_vehiculo_entrega` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "sigma_la"."uso_vehiculo_entrega" DROP COLUMN "fecha_hora_ini_est",
ADD COLUMN     "fecha_hora_fin_est" TIMESTAMP(6) NOT NULL;
