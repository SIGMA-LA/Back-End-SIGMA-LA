import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function check() {
  const empleado = await prisma.empleado.findUnique({
    where: { cuil: '20999999992' },
  })

  if (empleado) {
    console.log('✅ Empleado encontrado:')
    console.log('  CUIL:', empleado.cuil)
    console.log('  Nombre:', empleado.nombre, empleado.apellido)
    console.log('  Rol:', empleado.rol_actual)
    console.log('  Tiene contraseña:', !!empleado.contrasenia)
    console.log('  Longitud hash:', empleado.contrasenia?.length)
  } else {
    console.log('❌ Empleado NO encontrado con CUIL: 20999999992')
  }

  const todos = await prisma.empleado.findMany()
  console.log('\n📋 Total empleados en BD:', todos.length)
  todos.forEach(emp => {
    console.log(
      `  - ${emp.cuil}: ${emp.nombre} ${emp.apellido} (${emp.rol_actual})`,
    )
  })

  await prisma.$disconnect()
}

check()
