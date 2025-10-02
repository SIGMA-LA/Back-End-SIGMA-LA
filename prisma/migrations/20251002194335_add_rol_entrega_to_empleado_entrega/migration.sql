/*
  Warnings:

  - Added the required column `rol_entrega` to the `entrega_empleado` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "sigma_la"."entrega_empleado" ADD COLUMN     "rol_entrega" VARCHAR(20) NOT NULL;
