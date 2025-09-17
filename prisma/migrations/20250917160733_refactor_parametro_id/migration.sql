/*
  Warnings:

  - The primary key for the `parametro` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "sigma_la"."parametro" DROP CONSTRAINT "parametro_pkey",
ADD COLUMN     "cod_parametro" SERIAL NOT NULL,
ADD CONSTRAINT "parametro_pkey" PRIMARY KEY ("cod_parametro");
