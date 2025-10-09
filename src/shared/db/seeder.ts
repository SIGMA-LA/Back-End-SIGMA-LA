import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function dropDataBase() {
  await prisma.empleado_visita.deleteMany()
  await prisma.entrega_empleado.deleteMany()
  await prisma.orden_de_produccion.deleteMany()
  await prisma.visita.deleteMany()
  await prisma.entrega.deleteMany()
  await prisma.pago.deleteMany()
  await prisma.obra.deleteMany()
  await prisma.vehiculo.deleteMany()
  await prisma.maquinaria.deleteMany()
  await prisma.empleado.deleteMany()
  await prisma.cliente.deleteMany()
  await prisma.parametro.deleteMany()
  await prisma.uso_maquinaria.deleteMany()
  await prisma.presupuesto.deleteMany()
  await prisma.uso_vehiculo_entrega.deleteMany()
  await prisma.uso_vehiculo_visita.deleteMany()
  console.log('Base de datos limpiada')
}

const API_URL = 'http://localhost:4000'

async function post(url: string, data: Record<string, unknown>) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Error ${res.status} en ${url}: ${err}`)
  }
  return res.json()
}

async function seed() {
  // CLIENTES
  await post(`${API_URL}/api/clientes`, {
    cuil: '20111111111',
    tipo_cliente: 'EMPRESA',
    razon_social: 'Constructora San Martín S.A.',
    telefono: '+54 9 11 1234 5678',
    mail: 'contacto@constructorasanmartin.com.ar',
  })
  await post(`${API_URL}/api/clientes`, {
    cuil: '20222222222',
    tipo_cliente: 'EMPRESA',
    razon_social: 'Edificaciones del Litoral S.R.L.',
    telefono: '+54 9 11 1234 5678',
    mail: 'ventas@edificacionesdellitoral.com.ar',
  })
  await post(`${API_URL}/api/clientes`, {
    cuil: '20333333333',
    tipo_cliente: 'EMPRESA',
    razon_social: 'Desarrollos Urbanos Santa Fe S.A.',
    telefono: '+54 9 11 1234 5678',
    mail: 'proyectos@desarrollosurbanos.com.ar',
  })
  await post(`${API_URL}/api/clientes`, {
    cuil: '20444444444',
    tipo_cliente: 'PERSONA',
    nombre: 'Juan',
    apellido: 'Pérez',
    sexo: 'MASCULINO',
    telefono: '+54 9 11 1234 5678',
    mail: 'juan.perez@gmail.com',
  })
  await post(`${API_URL}/api/clientes`, {
    cuil: '20555555555',
    tipo_cliente: 'PERSONA',
    nombre: 'María',
    apellido: 'Gómez',
    sexo: 'FEMENINO',
    telefono: '+54 9 11 1234 5678',
    mail: 'maria.gomez@gmail.com',
  })
  await post(`${API_URL}/api/clientes`, {
    cuil: '20666666666',
    tipo_cliente: 'EMPRESA',
    razon_social: 'Grupo Constructor Tucumán S.A.',
    telefono: '+54 9 11 1234 5678',
    mail: 'gerencia@constructortucuman.com.ar',
  })

  // EMPLEADOS
  const roles = ['ADMIN', 'COORDINACION', 'VISITADOR', 'VENTAS', 'PRODUCCION']
  const areas = [
    'COORDINACION',
    'VENTAS',
    'PRODUCCION',
    'ATENCION_CLIENTE',
    'PRODUCCION',
  ]
  for (let i = 0; i < roles.length; i++) {
    await post(`${API_URL}/api/empleados`, {
      cuil: `2099999999${i}`,
      nombre: roles[i].charAt(0) + roles[i].slice(1).toLowerCase(),
      apellido: 'Test',
      rol_actual: roles[i],
      area_trabajo: areas[i],
      contrasenia: 'test1234',
    })
  }
  const nombresPlanta = ['Carlos', 'Miguel', 'Roberto', 'Fernando', 'Diego']
  const apellidosPlanta = [
    'Martinez',
    'Lopez',
    'Garcia',
    'Rodriguez',
    'Gonzalez',
  ]
  const areasPlanta = [
    'MECANIZADO',
    'CORTE',
    'ALMACEN',
    'ENSAMBLE',
    'PRODUCCION',
  ]
  for (let i = 0; i < 5; i++) {
    await post(`${API_URL}/api/empleados`, {
      cuil: `209999999${10 + i}`,
      nombre: nombresPlanta[i],
      apellido: apellidosPlanta[i],
      rol_actual: 'PLANTA',
      area_trabajo: areasPlanta[i],
      contrasenia: 'test1234',
    })
  }

  // MAQUINARIAS
  await post(`${API_URL}/api/maquinarias`, {
    cod_maquina: 1,
    descripcion: 'Excavadora',
    estado: 'DISPONIBLE',
  })
  await post(`${API_URL}/api/maquinarias`, {
    cod_maquina: 2,
    descripcion: 'Grua',
    estado: 'DISPONIBLE',
  })
  await post(`${API_URL}/api/maquinarias`, {
    cod_maquina: 3,
    descripcion: 'Camión',
    estado: 'NO DISPONIBLE',
  })

  // VEHICULOS (con anio, marca, modelo)
  await post(`${API_URL}/api/vehiculos`, {
    patente: 'ABC123',
    tipo_vehiculo: 'CAMIONETA',
    estado: 'DISPONIBLE',
    anio: 2022,
    marca: 'Toyota',
    modelo: 'Hilux',
  })
  await post(`${API_URL}/api/vehiculos`, {
    patente: 'DEF456',
    tipo_vehiculo: 'CAMION CHICO',
    estado: 'DISPONIBLE',
    anio: 2020,
    marca: 'Ford',
    modelo: 'F-350',
  })
  await post(`${API_URL}/api/vehiculos`, {
    patente: 'GHI789',
    tipo_vehiculo: 'AUTOMOVIL',
    estado: 'FUERA DE SERVICIO',
    anio: 2018,
    marca: 'Chevrolet',
    modelo: 'Onix',
  })

  // OBRAS (cod_localidad y cuil de cliente)
  await post(`${API_URL}/api/obras`, {
    cod_obra: 1,
    cod_localidad: 2000,
    cuil: '20111111111',
    fecha_ini: '2025-09-01',
    estado: 'EN PRODUCCION',
    direccion: 'Av. Pellegrini 1250, Rosario',
    nota_fabrica:
      'https://res.cloudinary.com/dqiqkfr8z/image/upload/v1759612724/MODELO_Parcial_2_-_para_practicar_-_2025_yr9rpx.pdf',
    nota_fabrica_pid: 'MODELO_Parcial_2_-_para_practicar_-_2025_yr9rpx',
  })
  await post(`${API_URL}/api/obras`, {
    cod_obra: 2,
    cod_localidad: 2210,
    cuil: '20222222222',
    fecha_ini: '2025-09-02',
    estado: 'EN ESPERA DE PAGO',
    direccion: 'Av. San Martín 850',
    nota_fabrica: null,
    nota_fabrica_pid: null,
  })
  await post(`${API_URL}/api/obras`, {
    cod_obra: 3,
    cod_localidad: 1000,
    cuil: '20333333333',
    fecha_ini: '2025-09-03',
    estado: 'CANCELADA',
    direccion: 'Bv. Gálvez 1680',
    nota_fabrica: null,
    nota_fabrica_pid: null,
  })
  await post(`${API_URL}/api/obras`, {
    cod_obra: 4,
    cod_localidad: 1900,
    cuil: '20444444444',
    fecha_ini: '2025-09-04',
    estado: 'EN PRODUCCION',
    direccion: 'Calle 7 entre 47 y 48',
    nota_fabrica: null,
    nota_fabrica_pid: null,
  })
  await post(`${API_URL}/api/obras`, {
    cod_obra: 5,
    cod_localidad: 500,
    cuil: '20555555555',
    fecha_ini: '2025-09-05',
    estado: 'EN ESPERA DE PAGO',
    direccion: 'Av. Colón 4500',
    nota_fabrica:
      'https://res.cloudinary.com/dqiqkfr8z/image/upload/v1759612724/MODELO_Parcial_2_-_para_practicar_-_2025_yr9rpx.pdf',
    nota_fabrica_pid: 'MODELO_Parcial_2_-_para_practicar_-_2025_yr9rpx',
  })
  await post(`${API_URL}/api/obras`, {
    cod_obra: 6,
    cod_localidad: 400,
    cuil: '20666666666',
    fecha_ini: '2025-09-06',
    estado: 'EN ESPERA DE PAGO',
    direccion: 'Av. Aconquija 1200',
    nota_fabrica:
      'https://res.cloudinary.com/dqiqkfr8z/image/upload/v1759612724/MODELO_Parcial_2_-_para_practicar_-_2025_yr9rpx.pdf',
    nota_fabrica_pid: 'MODELO_Parcial_2_-_para_practicar_-_2025_yr9rpx',
  })

  // PAGOS
  const pagos = [
    { cod_obra: 1, fecha_pago: '2025-09-10', monto: 150000 },
    { cod_obra: 1, fecha_pago: '2025-09-20', monto: 80000 },
    { cod_obra: 2, fecha_pago: '2025-09-12', monto: 120000 },
    { cod_obra: 2, fecha_pago: '2025-09-22', monto: 95000 },
    { cod_obra: 3, fecha_pago: '2025-09-15', monto: 180000 },
    { cod_obra: 3, fecha_pago: '2025-09-25', monto: 110000 },
    { cod_obra: 4, fecha_pago: '2025-09-18', monto: 95000 },
    { cod_obra: 4, fecha_pago: '2025-09-28', monto: 70000 },
    { cod_obra: 5, fecha_pago: '2025-09-20', monto: 210000 },
    { cod_obra: 5, fecha_pago: '2025-09-30', monto: 120000 },
    { cod_obra: 6, fecha_pago: '2025-09-22', monto: 175000 },
    { cod_obra: 6, fecha_pago: '2025-10-02', monto: 90000 },
  ]
  for (const pago of pagos) {
    await post(`${API_URL}/api/pagos`, pago)
  }

  // ENTREGAS
  await post(`${API_URL}/api/entregas`, {
    cod_obra: 1,
    fecha_hora_entrega: '2025-09-05T09:00',
    estado: 'PENDIENTE',
    detalle: 'Entrega de aberturas piso 1-3',
    observaciones: 'Verificar medidas antes de instalación',
    empleados: [
      { cuil: '20999999992', rol_entrega: 'ENCARGADO' },
      { cuil: '20999999910', rol_entrega: 'AYUDANTE' },
    ],
  })
  await post(`${API_URL}/api/entregas`, {
    cod_obra: 1,
    fecha_hora_entrega: '2025-09-10T14:00',
    estado: 'EN CURSO',
    detalle: 'Entrega parcial piso 4-6',
    observaciones: 'Faltan herrajes de seguridad',
    empleados: [
      { cuil: '20999999912', rol_entrega: 'ENCARGADO' },
      { cuil: '20999999913', rol_entrega: 'AYUDANTE' },
    ],
  })
  await post(`${API_URL}/api/entregas`, {
    cod_obra: 2,
    fecha_hora_entrega: '2025-09-12T11:30',
    estado: 'ENTREGADO',
    detalle: 'Entrega completa bloques A y B',
    observaciones: 'Entrega conforme - documentación firmada',
    empleados: [
      { cuil: '20999999911', rol_entrega: 'ENCARGADO' },
      { cuil: '20999999914', rol_entrega: 'AYUDANTE' },
    ],
  })
  await post(`${API_URL}/api/entregas`, {
    cod_obra: 2,
    fecha_hora_entrega: '2025-09-15T16:00',
    estado: 'CANCELADO',
    detalle: 'Entrega bloque C',
    observaciones: 'Obra suspendida temporalmente por cliente',
    empleados: [],
  })
  await post(`${API_URL}/api/entregas`, {
    cod_obra: 3,
    fecha_hora_entrega: '2025-09-18T10:00',
    estado: 'PENDIENTE',
    detalle: 'Aberturas planta baja comercial',
    observaciones: 'Requiere coordinación con electricista',
    empleados: [],
  })
  await post(`${API_URL}/api/entregas`, {
    cod_obra: 3,
    fecha_hora_entrega: '2025-09-20T13:00',
    estado: 'EN CURSO',
    detalle: 'Mamparas divisorias primer piso',
    observaciones: 'Pendiente entrega de vidrios templados',
    empleados: [],
  })
  await post(`${API_URL}/api/entregas`, {
    cod_obra: 4,
    fecha_hora_entrega: '2025-09-22T15:30',
    estado: 'ENTREGADO',
    detalle: 'Ventanales fachada principal',
    observaciones: 'Instalación perfecta - cliente satisfecho',
    empleados: [],
  })
  await post(`${API_URL}/api/entregas`, {
    cod_obra: 5,
    fecha_hora_entrega: '2025-09-25T09:30',
    estado: 'PENDIENTE',
    detalle: 'Puertas principales casas 1-20',
    observaciones: 'Coordinar con paisajista para accesos',
    empleados: [],
  })
  await post(`${API_URL}/api/entregas`, {
    cod_obra: 5,
    fecha_hora_entrega: '2025-09-28T11:00',
    estado: 'EN CURSO',
    detalle: 'Ventanas casas 21-40',
    observaciones: 'Modificación en color solicitada por cliente',
    empleados: [],
  })
  await post(`${API_URL}/api/entregas`, {
    cod_obra: 6,
    fecha_hora_entrega: '2025-09-30T17:00',
    estado: 'ENTREGADO',
    detalle: 'Cerramiento integral Torre A',
    observaciones: 'Proyecto finalizado exitosamente',
    empleados: [],
  })

  // VISITAS (con y sin obra asociada)
  // Con obra asociada: cod_obra, cod_localidad y datos de cliente en null
  await post(`${API_URL}/api/visitas`, {
    fecha_hora_visita: '2025-09-06T10:00',
    cod_obra: 1,
    cod_localidad: null,
    motivo_visita: 'MEDICION',
    estado: 'PROGRAMADA',
    observaciones: 'Medición inicial para aberturas piso 1-3',
    direccion_visita: 'Av. Pellegrini 1250, Rosario',
    nombre_cliente: null,
    apellido_cliente: null,
    telefono_cliente: null,
  })
  await post(`${API_URL}/api/visitas`, {
    fecha_hora_visita: '2025-09-07T11:30',
    cod_obra: 2,
    cod_localidad: null,
    motivo_visita: 'RE-MEDICION',
    estado: 'EN CURSO',
    observaciones: 'Ajuste medidas bloque B por modificación estructural',
    direccion_visita: 'Av. San Martín 850, San Lorenzo',
    nombre_cliente: null,
    apellido_cliente: null,
    telefono_cliente: null,
  })
  await post(`${API_URL}/api/visitas`, {
    fecha_hora_visita: '2025-09-08T09:00',
    cod_obra: 3,
    cod_localidad: null,
    motivo_visita: 'ASESORAMIENTO',
    estado: 'COMPLETADA',
    observaciones: 'Reparación marco puerta principal - resuelto',
    direccion_visita: 'Bv. Gálvez 1680, Santa Fe',
    nombre_cliente: null,
    apellido_cliente: null,
    telefono_cliente: null,
  })
  // Sin obra asociada: cod_obra null, cod_localidad y datos de cliente completos
  await post(`${API_URL}/api/visitas`, {
    fecha_hora_visita: '2025-09-16T10:00',
    cod_obra: null,
    cod_localidad: 200,
    motivo_visita: 'VISITA INICIAL',
    estado: 'PROGRAMADA',
    observaciones: 'Visita a cliente particular sin obra asociada',
    direccion_visita: 'San Juan 1234',
    nombre_cliente: 'Lucía',
    apellido_cliente: 'Fernández',
    telefono_cliente: '0341-5551234',
  })
  await post(`${API_URL}/api/visitas`, {
    fecha_hora_visita: '2025-09-17T15:30',
    cod_obra: null,
    cod_localidad: 2200,
    motivo_visita: 'ASESORAMIENTO',
    estado: 'PROGRAMADA',
    observaciones: 'Consulta por presupuesto de aberturas',
    direccion_visita: 'Av. Pellegrini 2000',
    nombre_cliente: 'Martín',
    apellido_cliente: 'Giménez',
    telefono_cliente: '0341-5555678',
  })

  // PARAMETROS
  await post(`${API_URL}/api/parametros`, {
    cod_parametro: 1,
    fecha_cambio: '2025-01-01',
    hora_cambio: '08:00:00',
    dias_vigencia_presu: 30,
    viatico_dia_persona: 1000,
  })
  await post(`${API_URL}/api/parametros`, {
    cod_parametro: 2,
    fecha_cambio: '2025-02-01',
    hora_cambio: '09:00:00',
    dias_vigencia_presu: 20,
    viatico_dia_persona: 800,
  })
}
await dropDataBase()
seed()
  .then(() => console.log('Seed completado con éxito'))
  .catch(e => console.error('Error en seed:', e))
