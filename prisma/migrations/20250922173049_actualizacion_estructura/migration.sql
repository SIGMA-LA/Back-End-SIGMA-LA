/*
  Warnings:

  - The primary key for the `uso_maquinaria` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `cod_obra` on the `uso_maquinaria` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_hora_entrega` on the `uso_maquinaria` table. All the data in the column will be lost.
  - The primary key for the `uso_vehiculo_entrega` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `cod_obra` on the `uso_vehiculo_entrega` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_hora_entrega` on the `uso_vehiculo_entrega` table. All the data in the column will be lost.
  - The primary key for the `uso_vehiculo_visita` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `cod_entrega` to the `uso_maquinaria` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cod_entrega` to the `uso_vehiculo_entrega` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "sigma_la"."uso_maquinaria" DROP CONSTRAINT "uso_maquinaria_cod_obra_fkey";

-- DropForeignKey
ALTER TABLE "sigma_la"."uso_vehiculo_entrega" DROP CONSTRAINT "uso_vehiculo_entrega_cod_obra_fkey";

-- AlterTable
ALTER TABLE "sigma_la"."uso_maquinaria" DROP CONSTRAINT "uso_maquinaria_pkey",
DROP COLUMN "cod_obra",
DROP COLUMN "fecha_hora_entrega",
ADD COLUMN     "cod_entrega" INTEGER NOT NULL,
ADD COLUMN     "obraCod_obra" INTEGER,
ADD CONSTRAINT "uso_maquinaria_pkey" PRIMARY KEY ("cod_maquina", "cod_entrega");

-- AlterTable
ALTER TABLE "sigma_la"."uso_vehiculo_entrega" DROP CONSTRAINT "uso_vehiculo_entrega_pkey",
DROP COLUMN "cod_obra",
DROP COLUMN "fecha_hora_entrega",
ADD COLUMN     "cod_entrega" INTEGER NOT NULL,
ADD COLUMN     "obraCod_obra" INTEGER,
ADD CONSTRAINT "uso_vehiculo_entrega_pkey" PRIMARY KEY ("patente", "cod_entrega");

-- AlterTable
ALTER TABLE "sigma_la"."uso_vehiculo_visita" DROP CONSTRAINT "uso_vehiculo_visita_pkey",
ADD CONSTRAINT "uso_vehiculo_visita_pkey" PRIMARY KEY ("patente", "cod_visita");

-- AddForeignKey
ALTER TABLE "sigma_la"."uso_maquinaria" ADD CONSTRAINT "uso_maquinaria_cod_entrega_fkey" FOREIGN KEY ("cod_entrega") REFERENCES "sigma_la"."entrega"("cod_entrega") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sigma_la"."uso_maquinaria" ADD CONSTRAINT "uso_maquinaria_obraCod_obra_fkey" FOREIGN KEY ("obraCod_obra") REFERENCES "sigma_la"."obra"("cod_obra") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sigma_la"."uso_vehiculo_entrega" ADD CONSTRAINT "uso_vehiculo_entrega_cod_entrega_fkey" FOREIGN KEY ("cod_entrega") REFERENCES "sigma_la"."entrega"("cod_entrega") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sigma_la"."uso_vehiculo_entrega" ADD CONSTRAINT "uso_vehiculo_entrega_obraCod_obra_fkey" FOREIGN KEY ("obraCod_obra") REFERENCES "sigma_la"."obra"("cod_obra") ON DELETE SET NULL ON UPDATE CASCADE;
