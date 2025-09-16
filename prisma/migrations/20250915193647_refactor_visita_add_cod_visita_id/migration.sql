/*
  Warnings:

  - The primary key for the `empleado_visita` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `cod_obra` on the `empleado_visita` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_hora_visita` on the `empleado_visita` table. All the data in the column will be lost.
  - The primary key for the `uso_vehiculo_visita` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `cod_obra` on the `uso_vehiculo_visita` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_hora_visita` on the `uso_vehiculo_visita` table. All the data in the column will be lost.
  - The primary key for the `visita` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `cod_visita` to the `empleado_visita` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cod_visita` to the `uso_vehiculo_visita` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "sigma_la"."empleado_visita" DROP CONSTRAINT "empleado_visita_cod_obra_fkey";

-- DropForeignKey
ALTER TABLE "sigma_la"."uso_vehiculo_visita" DROP CONSTRAINT "uso_vehiculo_visita_cod_obra_fkey";

-- AlterTable
ALTER TABLE "sigma_la"."empleado_visita" DROP CONSTRAINT "empleado_visita_pkey",
DROP COLUMN "cod_obra",
DROP COLUMN "fecha_hora_visita",
ADD COLUMN     "cod_visita" INTEGER NOT NULL,
ADD CONSTRAINT "empleado_visita_pkey" PRIMARY KEY ("cuil", "cod_visita");

-- AlterTable
ALTER TABLE "sigma_la"."uso_vehiculo_visita" DROP CONSTRAINT "uso_vehiculo_visita_pkey",
DROP COLUMN "cod_obra",
DROP COLUMN "fecha_hora_visita",
ADD COLUMN     "cod_visita" INTEGER NOT NULL,
ADD CONSTRAINT "uso_vehiculo_visita_pkey" PRIMARY KEY ("patente", "cod_visita", "fecha_hora_ini_uso");

-- AlterTable
ALTER TABLE "sigma_la"."visita" DROP CONSTRAINT "visita_pkey",
ADD COLUMN     "cod_visita" SERIAL NOT NULL,
ALTER COLUMN "cod_obra" DROP NOT NULL,
ALTER COLUMN "cod_postal" DROP NOT NULL,
ADD CONSTRAINT "visita_pkey" PRIMARY KEY ("cod_visita");

-- CreateIndex
CREATE INDEX "visita_cod_obra_idx" ON "sigma_la"."visita"("cod_obra");

-- CreateIndex
CREATE INDEX "visita_cod_postal_idx" ON "sigma_la"."visita"("cod_postal");

-- CreateIndex
CREATE INDEX "visita_fecha_hora_visita_idx" ON "sigma_la"."visita"("fecha_hora_visita");

-- AddForeignKey
ALTER TABLE "sigma_la"."empleado_visita" ADD CONSTRAINT "empleado_visita_cod_visita_fkey" FOREIGN KEY ("cod_visita") REFERENCES "sigma_la"."visita"("cod_visita") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sigma_la"."uso_vehiculo_visita" ADD CONSTRAINT "uso_vehiculo_visita_cod_visita_fkey" FOREIGN KEY ("cod_visita") REFERENCES "sigma_la"."visita"("cod_visita") ON DELETE NO ACTION ON UPDATE NO ACTION;
