import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const configs = await prisma.config_coordinacion.findMany({
    where: {
      visita_completada: true,
      empleado: {
        rol_actual: 'COORDINACION',
        activo: true,
        mail: { not: null },
        notificacion_email: true
      }
    },
    select: { empleado: { select: { mail: true } } }
  });
  console.log('Correos encontrados:', configs.map(c => c.empleado.mail));
}
run().then(() => process.exit(0));
