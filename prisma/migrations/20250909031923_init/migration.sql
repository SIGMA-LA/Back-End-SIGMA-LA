-- CreateTable
CREATE TABLE "sigma_la"."cliente" (
    "cuil" BIGINT NOT NULL,
    "razon_social" VARCHAR(50) NOT NULL,
    "telefono" VARCHAR(20) NOT NULL,
    "mail" VARCHAR(100) NOT NULL,

    CONSTRAINT "cliente_pkey" PRIMARY KEY ("cuil")
);

-- CreateTable
CREATE TABLE "sigma_la"."empleado" (
    "cuil" BIGINT NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "apellido" VARCHAR(50) NOT NULL,
    "rol_actual" VARCHAR(50) NOT NULL,
    "area_trabajo" VARCHAR(50) NOT NULL,
    "contrasenia" VARCHAR(50),

    CONSTRAINT "empleado_pkey" PRIMARY KEY ("cuil")
);

-- CreateTable
CREATE TABLE "sigma_la"."empleado_visita" (
    "cuil" BIGINT NOT NULL,
    "fecha_hora_visita" TIMESTAMP(6) NOT NULL,
    "cod_obra" INTEGER NOT NULL,

    CONSTRAINT "empleado_visita_pkey" PRIMARY KEY ("cuil","fecha_hora_visita","cod_obra")
);

-- CreateTable
CREATE TABLE "sigma_la"."entrega" (
    "cod_obra" INTEGER NOT NULL,
    "fecha_hora_entrega" TIMESTAMP(6) NOT NULL,
    "estado" VARCHAR(50) NOT NULL,
    "observaciones" VARCHAR(500),
    "detalle" VARCHAR(50) NOT NULL,

    CONSTRAINT "entrega_pkey" PRIMARY KEY ("cod_obra","fecha_hora_entrega")
);

-- CreateTable
CREATE TABLE "sigma_la"."entrega_empleado" (
    "fecha_hora_entrega" TIMESTAMP(6) NOT NULL,
    "cuil" BIGINT NOT NULL,
    "cod_obra" INTEGER NOT NULL,

    CONSTRAINT "entrega_empleado_pkey" PRIMARY KEY ("fecha_hora_entrega","cuil")
);

-- CreateTable
CREATE TABLE "sigma_la"."localidad" (
    "cod_postal" INTEGER NOT NULL,
    "nombre_localidad" VARCHAR(255) NOT NULL,

    CONSTRAINT "localidad_pkey" PRIMARY KEY ("cod_postal")
);

-- CreateTable
CREATE TABLE "sigma_la"."maquinaria" (
    "cod_maquina" SERIAL NOT NULL,
    "descripcion" VARCHAR(255) NOT NULL,
    "estado" VARCHAR(50) NOT NULL,

    CONSTRAINT "maquinaria_pkey" PRIMARY KEY ("cod_maquina")
);

-- CreateTable
CREATE TABLE "sigma_la"."obra" (
    "cod_obra" SERIAL NOT NULL,
    "cod_postal" INTEGER NOT NULL,
    "cuil" BIGINT NOT NULL,
    "fecha_ini" DATE NOT NULL,
    "estado" VARCHAR(50) NOT NULL,
    "fecha_cancelacion" DATE,
    "direccion" VARCHAR(500) NOT NULL,
    "nota_fabrica" VARCHAR(255) NOT NULL,

    CONSTRAINT "obra_pkey" PRIMARY KEY ("cod_obra")
);

-- CreateTable
CREATE TABLE "sigma_la"."orden_de_produccion" (
    "cod_obra" INTEGER NOT NULL,
    "fecha_confeccion" DATE NOT NULL,
    "fecha_validacion" DATE,
    "url" VARCHAR(255) NOT NULL,

    CONSTRAINT "orden_de_produccion_pkey" PRIMARY KEY ("cod_obra","fecha_confeccion")
);

-- CreateTable
CREATE TABLE "sigma_la"."pago" (
    "fecha_pago" DATE NOT NULL,
    "cod_obra" INTEGER NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "pago_pkey" PRIMARY KEY ("fecha_pago","cod_obra")
);

-- CreateTable
CREATE TABLE "sigma_la"."parametro" (
    "fecha_cambio" DATE NOT NULL,
    "hora_cambio" TIME(6) NOT NULL,
    "dias_vigencia_presu" INTEGER NOT NULL,
    "viatico_dia_persona" DOUBLE PRECISION,

    CONSTRAINT "parametro_pkey" PRIMARY KEY ("fecha_cambio","hora_cambio")
);

-- CreateTable
CREATE TABLE "sigma_la"."presupuesto" (
    "fecha_emision" DATE NOT NULL,
    "cod_obra" INTEGER NOT NULL,
    "fecha_aceptacion" DATE,
    "valor" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "presupuesto_pkey" PRIMARY KEY ("fecha_emision","cod_obra")
);

-- CreateTable
CREATE TABLE "sigma_la"."uso_maquinaria" (
    "cod_maquina" INTEGER NOT NULL,
    "fecha_hora_entrega" TIMESTAMP(6) NOT NULL,
    "fecha_hora_ini_uso" TIMESTAMP(6) NOT NULL,
    "cod_obra" INTEGER NOT NULL,
    "fecha_hora_fin_est" TIMESTAMP(6) NOT NULL,
    "fecha_hora_fin_real" TIMESTAMP(6),
    "estado" VARCHAR(50) NOT NULL,

    CONSTRAINT "uso_maquinaria_pkey" PRIMARY KEY ("cod_maquina","fecha_hora_entrega","fecha_hora_ini_uso","cod_obra")
);

-- CreateTable
CREATE TABLE "sigma_la"."uso_vehiculo_entrega" (
    "patente" VARCHAR(10) NOT NULL,
    "fecha_hora_entrega" TIMESTAMP(6) NOT NULL,
    "fecha_hora_ini_uso" TIMESTAMP(6) NOT NULL,
    "cod_obra" INTEGER NOT NULL,
    "fecha_hora_ini_est" TIMESTAMP(6) NOT NULL,
    "fecha_hora_fin_real" TIMESTAMP(6),
    "estado" VARCHAR(50) NOT NULL,

    CONSTRAINT "uso_vehiculo_entrega_pkey" PRIMARY KEY ("patente","fecha_hora_ini_uso","cod_obra")
);

-- CreateTable
CREATE TABLE "sigma_la"."uso_vehiculo_visita" (
    "patente" VARCHAR(10) NOT NULL,
    "fecha_hora_visita" TIMESTAMP(6) NOT NULL,
    "fecha_hora_ini_uso" TIMESTAMP(6) NOT NULL,
    "cod_obra" INTEGER NOT NULL,
    "fecha_hora_fin_est" TIMESTAMP(6) NOT NULL,
    "fecha_hora_fin_real" TIMESTAMP(6),
    "estado" VARCHAR(50) NOT NULL,

    CONSTRAINT "uso_vehiculo_visita_pkey" PRIMARY KEY ("patente","fecha_hora_ini_uso","cod_obra")
);

-- CreateTable
CREATE TABLE "sigma_la"."vehiculo" (
    "patente" VARCHAR(10) NOT NULL,
    "tipo_vehiculo" VARCHAR(50) NOT NULL,
    "estado" VARCHAR(50) NOT NULL,

    CONSTRAINT "vehiculo_pkey" PRIMARY KEY ("patente")
);

-- CreateTable
CREATE TABLE "sigma_la"."visita" (
    "fecha_hora_visita" TIMESTAMP(6) NOT NULL,
    "cod_obra" INTEGER NOT NULL,
    "cod_postal" INTEGER NOT NULL,
    "fecha_cancelacion" DATE,
    "observaciones" VARCHAR(500),
    "motivo_visita" VARCHAR(50) NOT NULL,
    "estado" VARCHAR(50) NOT NULL,
    "direccion_visita" VARCHAR(500),

    CONSTRAINT "visita_pkey" PRIMARY KEY ("fecha_hora_visita","cod_obra")
);

-- AddForeignKey
ALTER TABLE "sigma_la"."empleado_visita" ADD CONSTRAINT "empleado_visita_cod_obra_fkey" FOREIGN KEY ("cod_obra") REFERENCES "sigma_la"."obra"("cod_obra") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sigma_la"."empleado_visita" ADD CONSTRAINT "empleado_visita_cuil_fkey" FOREIGN KEY ("cuil") REFERENCES "sigma_la"."empleado"("cuil") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sigma_la"."entrega" ADD CONSTRAINT "entrega_cod_obra_fkey" FOREIGN KEY ("cod_obra") REFERENCES "sigma_la"."obra"("cod_obra") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sigma_la"."entrega_empleado" ADD CONSTRAINT "entrega_empleado_cod_obra_fkey" FOREIGN KEY ("cod_obra") REFERENCES "sigma_la"."obra"("cod_obra") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sigma_la"."entrega_empleado" ADD CONSTRAINT "entrega_empleado_cuil_fkey" FOREIGN KEY ("cuil") REFERENCES "sigma_la"."empleado"("cuil") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sigma_la"."obra" ADD CONSTRAINT "obra_cod_postal_fkey" FOREIGN KEY ("cod_postal") REFERENCES "sigma_la"."localidad"("cod_postal") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sigma_la"."obra" ADD CONSTRAINT "obra_cuil_fkey" FOREIGN KEY ("cuil") REFERENCES "sigma_la"."cliente"("cuil") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sigma_la"."orden_de_produccion" ADD CONSTRAINT "orden_de_produccion_cod_obra_fkey" FOREIGN KEY ("cod_obra") REFERENCES "sigma_la"."obra"("cod_obra") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sigma_la"."pago" ADD CONSTRAINT "pago_cod_obra_fkey" FOREIGN KEY ("cod_obra") REFERENCES "sigma_la"."obra"("cod_obra") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sigma_la"."presupuesto" ADD CONSTRAINT "presupuesto_cod_obra_fkey" FOREIGN KEY ("cod_obra") REFERENCES "sigma_la"."obra"("cod_obra") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sigma_la"."uso_maquinaria" ADD CONSTRAINT "uso_maquinaria_cod_maquina_fkey" FOREIGN KEY ("cod_maquina") REFERENCES "sigma_la"."maquinaria"("cod_maquina") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sigma_la"."uso_maquinaria" ADD CONSTRAINT "uso_maquinaria_cod_obra_fkey" FOREIGN KEY ("cod_obra") REFERENCES "sigma_la"."obra"("cod_obra") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sigma_la"."uso_vehiculo_entrega" ADD CONSTRAINT "uso_vehiculo_entrega_cod_obra_fkey" FOREIGN KEY ("cod_obra") REFERENCES "sigma_la"."obra"("cod_obra") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sigma_la"."uso_vehiculo_entrega" ADD CONSTRAINT "uso_vehiculo_entrega_patente_fkey" FOREIGN KEY ("patente") REFERENCES "sigma_la"."vehiculo"("patente") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sigma_la"."uso_vehiculo_visita" ADD CONSTRAINT "uso_vehiculo_visita_cod_obra_fkey" FOREIGN KEY ("cod_obra") REFERENCES "sigma_la"."obra"("cod_obra") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sigma_la"."uso_vehiculo_visita" ADD CONSTRAINT "uso_vehiculo_visita_patente_fkey" FOREIGN KEY ("patente") REFERENCES "sigma_la"."vehiculo"("patente") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sigma_la"."visita" ADD CONSTRAINT "visita_cod_obra_fkey" FOREIGN KEY ("cod_obra") REFERENCES "sigma_la"."obra"("cod_obra") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sigma_la"."visita" ADD CONSTRAINT "visita_cod_postal_fkey" FOREIGN KEY ("cod_postal") REFERENCES "sigma_la"."localidad"("cod_postal") ON DELETE NO ACTION ON UPDATE NO ACTION;
