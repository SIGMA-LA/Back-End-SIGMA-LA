import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function seed() {
  console.log('🌱 Iniciando seed...')

  // Clientes (5 clientes)
  console.log('Creando clientes...')
  await prisma.cliente.create({
    data: {
      cuil: '20111111111',
      razon_social: 'Constructora ABC S.A.',
      telefono: '+54 9 11 1234 5678',
      mail: 'contacto@constructoraabc.com',
      tipo_cliente: 'EMPRESA',
    },
  })
  await prisma.cliente.create({
    data: {
      cuil: '20222222222',
      razon_social: 'Inmobiliaria XYZ',
      telefono: '+54 9 11 2345 6789',
      mail: 'info@inmobiliariaxyz.com',
      tipo_cliente: 'EMPRESA',
    },
  })
  await prisma.cliente.create({
    data: {
      cuil: '20333333333',
      nombre: 'Juan',
      apellido: 'Pérez',
      telefono: '+54 9 11 3456 7890',
      mail: 'juan.perez@gmail.com',
      sexo: 'M',
      tipo_cliente: 'PARTICULAR',
    },
  })
  await prisma.cliente.create({
    data: {
      cuil: '27444444444',
      nombre: 'María',
      apellido: 'González',
      telefono: '+54 9 11 4567 8901',
      mail: 'maria.gonzalez@hotmail.com',
      sexo: 'F',
      tipo_cliente: 'PARTICULAR',
    },
  })
  await prisma.cliente.create({
    data: {
      cuil: '20555555555',
      razon_social: 'Desarrollos Urbanos S.R.L.',
      telefono: '+54 9 11 5678 9012',
      mail: 'contacto@desarrollosurbanos.com',
      tipo_cliente: 'EMPRESA',
    },
  })

  // Empleados (1 por cada rol)
  console.log('Creando empleados...')

  // Hashear contraseñas
  const adminPassword = await bcrypt.hash('test1234', 10)
  const coordPassword = await bcrypt.hash('test1234', 10)
  const ventasPassword = await bcrypt.hash('test1234', 10)
  const prodPassword = await bcrypt.hash('test1234', 10)
  const plantaPassword = await bcrypt.hash('test1234', 10)
  const visitaPassword = await bcrypt.hash('test1234', 10)

  await prisma.empleado.create({
    data: {
      cuil: '20999999991',
      nombre: 'Carlos',
      apellido: 'Admin',
      rol_actual: 'ADMIN',
      area_trabajo: 'ADMINISTRACION',
      contrasenia: adminPassword,
    },
  })
  await prisma.empleado.create({
    data: {
      cuil: '20999999992',
      nombre: 'Laura',
      apellido: 'Coordinadora',
      rol_actual: 'COORDINACION',
      area_trabajo: 'COORDINACION',
      contrasenia: coordPassword,
    },
  })
  await prisma.empleado.create({
    data: {
      cuil: '20999999993',
      nombre: 'Martín',
      apellido: 'Vendedor',
      rol_actual: 'VENTAS',
      area_trabajo: 'VENTAS',
      contrasenia: ventasPassword,
    },
  })
  await prisma.empleado.create({
    data: {
      cuil: '20999999994',
      nombre: 'Ana',
      apellido: 'Producción',
      rol_actual: 'PRODUCCION',
      area_trabajo: 'PRODUCCION',
      contrasenia: prodPassword,
    },
  })
  await prisma.empleado.create({
    data: {
      cuil: '20999999995',
      nombre: 'Sofía',
      apellido: 'Visitadora',
      rol_actual: 'VISITADOR',
      area_trabajo: 'ATENCION_CLIENTE',
      contrasenia: visitaPassword,
    },
  })
  await prisma.empleado.create({
    data: {
      cuil: '20999999996',
      nombre: 'Roberto',
      apellido: 'Operario',
      rol_actual: 'PLANTA',
      area_trabajo: 'PLANTA',
      contrasenia: plantaPassword,
    },
  })

  // Vehículos (3 vehículos)
  console.log('Creando vehículos...')
  await prisma.vehiculo.create({
    data: {
      patente: 'ABC123',
      tipo_vehiculo: 'CAMIONETA',
      estado: 'DISPONIBLE',
    },
  })
  await prisma.vehiculo.create({
    data: {
      patente: 'DEF456',
      tipo_vehiculo: 'CAMION',
      estado: 'DISPONIBLE',
    },
  })
  await prisma.vehiculo.create({
    data: {
      patente: 'GHI789',
      tipo_vehiculo: 'AUTO',
      estado: 'EN_USO',
    },
  })

  // Obras (5 obras)
  console.log('Creando obras...')
  const obra1 = await prisma.obra.create({
    data: {
      cod_localidad: 1000, // Asumiendo que existe
      cuil: '20111111111',
      fecha_ini: new Date('2025-01-15'),
      estado: 'ACTIVA',
      direccion: 'Av. Corrientes 1234, CABA',
      nota_fabrica: null,
    },
  })
  const obra2 = await prisma.obra.create({
    data: {
      cod_localidad: 1900, // Asumiendo que existe
      cuil: '20222222222',
      fecha_ini: new Date('2025-02-10'),
      estado: 'EN PRODUCCION',
      direccion: 'Calle 50 entre 7 y 8, La Plata',
      nota_fabrica: 'Nota de fábrica aprobada',
    },
  })
  const obra3 = await prisma.obra.create({
    data: {
      cod_localidad: 2000, // Asumiendo que existe
      cuil: '20333333333',
      fecha_ini: new Date('2025-03-05'),
      estado: 'ACTIVA',
      direccion: 'San Martín 567, Rosario',
      nota_fabrica: null,
    },
  })
  const obra4 = await prisma.obra.create({
    data: {
      cod_localidad: 400, // Asumiendo que existe
      cuil: '27444444444',
      fecha_ini: new Date('2025-04-20'),
      estado: 'EN ESPERA DE PAGO',
      direccion: 'Av. Libertador 890, Mendoza',
      nota_fabrica: 'Pedido especial',
    },
  })
  const obra5 = await prisma.obra.create({
    data: {
      cod_localidad: 500, // Asumiendo que existe
      cuil: '20555555555',
      fecha_ini: new Date('2025-05-12'),
      estado: 'ACTIVA',
      direccion: 'Belgrano 345, Córdoba',
      nota_fabrica: null,
    },
  })

  const obras = [obra1, obra2, obra3, obra4, obra5]

  // Visitas (2 por cada obra = 10 visitas)
  console.log('Creando visitas...')
  for (const obra of obras) {
    // Visita 1
    const visita1 = await prisma.visita.create({
      data: {
        cod_obra: obra.cod_obra,
        fecha_hora_visita: new Date(
          `2025-0${obras.indexOf(obra) + 1}-20T10:00:00`,
        ),
        motivo_visita: 'Inspección inicial',
        estado: 'REALIZADA',
        observaciones: 'Todo en orden',
        direccion_visita: obra.direccion,
        cod_localidad: obra.cod_localidad,
        nombre_cliente: 'Cliente',
        apellido_cliente: 'Apellido',
        telefono_cliente: '+54 9 11 1111 1111',
        dias_viatico: 1,
      },
    })

    // Visita 2
    const visita2 = await prisma.visita.create({
      data: {
        cod_obra: obra.cod_obra,
        fecha_hora_visita: new Date(
          `2025-0${obras.indexOf(obra) + 1}-25T14:00:00`,
        ),
        motivo_visita: 'Seguimiento',
        estado: 'REALIZADA',
        observaciones: 'Avance según lo planeado',
        direccion_visita: obra.direccion,
        cod_localidad: obra.cod_localidad,
        nombre_cliente: 'Cliente',
        apellido_cliente: 'Apellido',
        telefono_cliente: '+54 9 11 1111 1111',
        dias_viatico: 1,
      },
    })

    // Asignar empleado VISITADOR a las visitas
    await prisma.empleado_visita.create({
      data: {
        cuil: '20999999995', // Sofía Visitadora
        cod_visita: visita1.cod_visita,
      },
    })
    await prisma.empleado_visita.create({
      data: {
        cuil: '20999999995', // Sofía Visitadora
        cod_visita: visita2.cod_visita,
      },
    })
  }

  // Pagos (2 por cada obra = 10 pagos)
  console.log('Creando pagos...')
  for (const obra of obras) {
    await prisma.pago.create({
      data: {
        cod_obra: obra.cod_obra,
        fecha_pago: new Date(`2025-0${obras.indexOf(obra) + 1}-10`),
        monto: 50000.0,
      },
    })
    await prisma.pago.create({
      data: {
        cod_obra: obra.cod_obra,
        fecha_pago: new Date(`2025-0${obras.indexOf(obra) + 1}-25`),
        monto: 75000.0,
      },
    })
  }

  // Entregas (2 por cada obra = 10 entregas)
  console.log('Creando entregas...')
  for (const obra of obras) {
    // Entrega 1
    const entrega1 = await prisma.entrega.create({
      data: {
        cod_obra: obra.cod_obra,
        fecha_hora_entrega: new Date(
          `2025-0${obras.indexOf(obra) + 1}-22T09:00:00`,
        ),
        estado: 'COMPLETADA',
        detalle: 'Primera entrega',
        observaciones: 'Entrega sin inconvenientes',
        dias_viaticos: 2,
      },
    })

    // Entrega 2
    const entrega2 = await prisma.entrega.create({
      data: {
        cod_obra: obra.cod_obra,
        fecha_hora_entrega: new Date(
          `2025-0${obras.indexOf(obra) + 1}-28T11:00:00`,
        ),
        estado: 'COMPLETADA',
        detalle: 'Segunda entrega',
        observaciones: 'Material verificado',
        dias_viaticos: 2,
      },
    })

    // Asignar empleado PLANTA a las entregas
    await prisma.entrega_empleado.create({
      data: {
        cuil: '20999999996', // Roberto Operario (PLANTA)
        cod_obra: obra.cod_obra,
        cod_entrega: entrega1.cod_entrega,
        rol_entrega: 'OPERARIO',
      },
    })
    await prisma.entrega_empleado.create({
      data: {
        cuil: '20999999996', // Roberto Operario (PLANTA)
        cod_obra: obra.cod_obra,
        cod_entrega: entrega2.cod_entrega,
        rol_entrega: 'OPERARIO',
      },
    })
  }

  console.log('✅ Seed completado con éxito')
}

seed()
  .then(() => {
    console.log('Desconectando Prisma...')
    return prisma.$disconnect()
  })
  .catch(e => {
    console.error('❌ Error en seed:', e)
    prisma.$disconnect()
    process.exit(1)
  })
