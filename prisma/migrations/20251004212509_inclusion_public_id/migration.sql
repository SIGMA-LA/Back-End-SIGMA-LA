/*
  Warnings:

  - Added the required column `nota_fabrica_pid` to the `obra` table without a default value. This is not possible if the table is not empty.
  - Added the required column `public_id` to the `orden_de_produccion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "obra" ADD COLUMN     "nota_fabrica_pid" VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE "orden_de_produccion" ADD COLUMN     "public_id" VARCHAR(255) NOT NULL;
