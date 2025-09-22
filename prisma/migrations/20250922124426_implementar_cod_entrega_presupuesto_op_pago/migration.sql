/*
  Warnings:

  - The primary key for the `entrega` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `entrega_empleado` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `fecha_hora_entrega` on the `entrega_empleado` table. All the data in the column will be lost.
  - The primary key for the `orden_de_produccion` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `pago` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `presupuesto` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `cod_entrega` to the `entrega_empleado` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "sigma_la"."entrega" DROP CONSTRAINT "entrega_pkey",
ADD COLUMN     "cod_entrega" SERIAL NOT NULL,
ADD CONSTRAINT "entrega_pkey" PRIMARY KEY ("cod_entrega");

-- AlterTable
ALTER TABLE "sigma_la"."entrega_empleado" DROP CONSTRAINT "entrega_empleado_pkey",
DROP COLUMN "fecha_hora_entrega",
ADD COLUMN     "cod_entrega" INTEGER NOT NULL,
ADD CONSTRAINT "entrega_empleado_pkey" PRIMARY KEY ("cod_entrega", "cuil");

-- AlterTable
ALTER TABLE "sigma_la"."orden_de_produccion" DROP CONSTRAINT "orden_de_produccion_pkey",
ADD COLUMN     "cod_op" SERIAL NOT NULL,
ADD CONSTRAINT "orden_de_produccion_pkey" PRIMARY KEY ("cod_op");

-- AlterTable
ALTER TABLE "sigma_la"."pago" DROP CONSTRAINT "pago_pkey",
ADD COLUMN     "cod_pago" SERIAL NOT NULL,
ADD CONSTRAINT "pago_pkey" PRIMARY KEY ("cod_pago");

-- AlterTable
ALTER TABLE "sigma_la"."presupuesto" DROP CONSTRAINT "presupuesto_pkey",
ADD COLUMN     "nro_presupuesto" SERIAL NOT NULL,
ADD CONSTRAINT "presupuesto_pkey" PRIMARY KEY ("nro_presupuesto");

-- AddForeignKey
ALTER TABLE "sigma_la"."entrega_empleado" ADD CONSTRAINT "entrega_empleado_cod_entrega_fkey" FOREIGN KEY ("cod_entrega") REFERENCES "sigma_la"."entrega"("cod_entrega") ON DELETE NO ACTION ON UPDATE NO ACTION;
