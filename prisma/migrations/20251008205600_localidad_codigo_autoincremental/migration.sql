-- AlterTable
CREATE SEQUENCE "sigma_la".localidad_cod_localidad_seq;
ALTER TABLE "sigma_la"."localidad" ALTER COLUMN "cod_localidad" SET DEFAULT nextval('"sigma_la".localidad_cod_localidad_seq');
ALTER SEQUENCE "sigma_la".localidad_cod_localidad_seq OWNED BY "sigma_la"."localidad"."cod_localidad";
