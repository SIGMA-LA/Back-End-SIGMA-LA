/*
  Warnings:

  - The primary key for the `localidad` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `cod_postal` on the `localidad` table. All the data in the column will be lost.
  - You are about to drop the column `cod_postal` on the `obra` table. All the data in the column will be lost.
  - You are about to drop the column `estado` on the `uso_maquinaria` table. All the data in the column will be lost.
  - You are about to drop the column `estado` on the `uso_vehiculo_entrega` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_hora_ini_est` on the `uso_vehiculo_entrega` table. All the data in the column will be lost.
  - You are about to drop the column `estado` on the `uso_vehiculo_visita` table. All the data in the column will be lost.
  - You are about to drop the column `cod_postal` on the `visita` table. All the data in the column will be lost.
  - Added the required column `tipo_cliente` to the `cliente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cod_localidad` to the `localidad` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cod_provincia` to the `localidad` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cod_localidad` to the `obra` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fecha_hora_fin_est` to the `uso_vehiculo_entrega` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "sigma_la"."obra" DROP CONSTRAINT "obra_cod_postal_fkey";

-- DropForeignKey
ALTER TABLE "sigma_la"."visita" DROP CONSTRAINT "visita_cod_postal_fkey";

-- DropIndex
DROP INDEX "sigma_la"."visita_cod_postal_idx";

-- AlterTable
ALTER TABLE "sigma_la"."cliente" ADD COLUMN     "apellido" VARCHAR(50),
ADD COLUMN     "nombre" VARCHAR(50),
ADD COLUMN     "sexo" VARCHAR(20),
ADD COLUMN     "tipo_cliente" VARCHAR(50) NOT NULL,
ALTER COLUMN "razon_social" DROP NOT NULL;

-- AlterTable
ALTER TABLE "sigma_la"."localidad" DROP CONSTRAINT "localidad_pkey",
DROP COLUMN "cod_postal",
ADD COLUMN     "cod_localidad" INTEGER NOT NULL,
ADD COLUMN     "cod_provincia" INTEGER NOT NULL,
ADD CONSTRAINT "localidad_pkey" PRIMARY KEY ("cod_localidad");

-- AlterTable
ALTER TABLE "sigma_la"."obra" DROP COLUMN "cod_postal",
ADD COLUMN     "cod_localidad" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "sigma_la"."uso_maquinaria" DROP COLUMN "estado";

-- AlterTable
ALTER TABLE "sigma_la"."uso_vehiculo_entrega" DROP COLUMN "estado",
DROP COLUMN "fecha_hora_ini_est",
ADD COLUMN     "fecha_hora_fin_est" TIMESTAMP(6) NOT NULL;

-- AlterTable
ALTER TABLE "sigma_la"."uso_vehiculo_visita" DROP COLUMN "estado";

-- AlterTable
ALTER TABLE "sigma_la"."vehiculo" ADD COLUMN     "anio" INTEGER,
ADD COLUMN     "marca" VARCHAR(50),
ADD COLUMN     "modelo" VARCHAR(50);

-- AlterTable
ALTER TABLE "sigma_la"."visita" DROP COLUMN "cod_postal",
ADD COLUMN     "apellido_cliente" VARCHAR(50),
ADD COLUMN     "cod_localidad" INTEGER,
ADD COLUMN     "dias_viatico" INTEGER,
ADD COLUMN     "nombre_cliente" VARCHAR(50),
ADD COLUMN     "telefono_cliente" VARCHAR(20);

-- CreateTable
CREATE TABLE "sigma_la"."provincia" (
    "cod_provincia" INTEGER NOT NULL,
    "nombre" VARCHAR(30) NOT NULL,

    CONSTRAINT "provincia_pkey" PRIMARY KEY ("cod_provincia")
);

-- CreateIndex
CREATE INDEX "visita_cod_localidad_idx" ON "sigma_la"."visita"("cod_localidad");

-- AddForeignKey
ALTER TABLE "sigma_la"."localidad" ADD CONSTRAINT "localidad_cod_provincia_fkey" FOREIGN KEY ("cod_provincia") REFERENCES "sigma_la"."provincia"("cod_provincia") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sigma_la"."obra" ADD CONSTRAINT "obra_cod_localidad_fkey" FOREIGN KEY ("cod_localidad") REFERENCES "sigma_la"."localidad"("cod_localidad") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sigma_la"."visita" ADD CONSTRAINT "visita_cod_localidad_fkey" FOREIGN KEY ("cod_localidad") REFERENCES "sigma_la"."localidad"("cod_localidad") ON DELETE NO ACTION ON UPDATE NO ACTION;
