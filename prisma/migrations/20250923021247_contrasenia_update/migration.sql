/*
  Warnings:

  - The primary key for the `uso_vehiculo_entrega` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `cod_uso_vehiculo_entrega` on the `uso_vehiculo_entrega` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_hora_fin_est` on the `uso_vehiculo_entrega` table. All the data in the column will be lost.
  - Added the required column `fecha_hora_ini_est` to the `uso_vehiculo_entrega` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "sigma_la"."uso_vehiculo_entrega_patente_fecha_hora_ini_uso_key";

-- AlterTable
ALTER TABLE "sigma_la"."empleado" ALTER COLUMN "contrasenia" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "sigma_la"."uso_vehiculo_entrega" DROP CONSTRAINT "uso_vehiculo_entrega_pkey",
DROP COLUMN "cod_uso_vehiculo_entrega",
DROP COLUMN "fecha_hora_fin_est",
ADD COLUMN     "fecha_hora_ini_est" TIMESTAMP(6) NOT NULL,
ADD CONSTRAINT "uso_vehiculo_entrega_pkey" PRIMARY KEY ("patente", "cod_entrega");
