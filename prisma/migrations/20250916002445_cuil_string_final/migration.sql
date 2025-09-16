/*
  Warnings:

  - The primary key for the `cliente` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `empleado` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `empleado_visita` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `entrega_empleado` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "sigma_la"."empleado_visita" DROP CONSTRAINT "empleado_visita_cuil_fkey";

-- DropForeignKey
ALTER TABLE "sigma_la"."entrega_empleado" DROP CONSTRAINT "entrega_empleado_cuil_fkey";

-- DropForeignKey
ALTER TABLE "sigma_la"."obra" DROP CONSTRAINT "obra_cuil_fkey";

-- AlterTable
ALTER TABLE "sigma_la"."cliente" DROP CONSTRAINT "cliente_pkey",
ALTER COLUMN "cuil" SET DATA TYPE TEXT,
ADD CONSTRAINT "cliente_pkey" PRIMARY KEY ("cuil");

-- AlterTable
ALTER TABLE "sigma_la"."empleado" DROP CONSTRAINT "empleado_pkey",
ALTER COLUMN "cuil" SET DATA TYPE TEXT,
ADD CONSTRAINT "empleado_pkey" PRIMARY KEY ("cuil");

-- AlterTable
ALTER TABLE "sigma_la"."empleado_visita" DROP CONSTRAINT "empleado_visita_pkey",
ALTER COLUMN "cuil" SET DATA TYPE TEXT,
ADD CONSTRAINT "empleado_visita_pkey" PRIMARY KEY ("cuil", "cod_visita");

-- AlterTable
ALTER TABLE "sigma_la"."entrega_empleado" DROP CONSTRAINT "entrega_empleado_pkey",
ALTER COLUMN "cuil" SET DATA TYPE TEXT,
ADD CONSTRAINT "entrega_empleado_pkey" PRIMARY KEY ("fecha_hora_entrega", "cuil");

-- AlterTable
ALTER TABLE "sigma_la"."obra" ALTER COLUMN "cuil" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "sigma_la"."empleado_visita" ADD CONSTRAINT "empleado_visita_cuil_fkey" FOREIGN KEY ("cuil") REFERENCES "sigma_la"."empleado"("cuil") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sigma_la"."entrega_empleado" ADD CONSTRAINT "entrega_empleado_cuil_fkey" FOREIGN KEY ("cuil") REFERENCES "sigma_la"."empleado"("cuil") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sigma_la"."obra" ADD CONSTRAINT "obra_cuil_fkey" FOREIGN KEY ("cuil") REFERENCES "sigma_la"."cliente"("cuil") ON DELETE NO ACTION ON UPDATE NO ACTION;
