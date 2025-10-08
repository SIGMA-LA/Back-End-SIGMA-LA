import seedLocalidades from './localidadesSeeder'

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

  //Provincias y Localidades
  seedLocalidades()

  // Empleados - Roles únicos
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
      area_trabajo: areas[i], // Ahora nunca será undefined
      contrasenia: 'test1234',
    })
  }

  // Empleados de PLANTA
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

  // Maquinarias
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

  // Vehículos
  await post(`${API_URL}/api/vehiculos`, {
    patente: 'ABC123',
    tipo_vehiculo: 'CAMIONETA',
    estado: 'DISPONIBLE',
  })
  await post(`${API_URL}/api/vehiculos`, {
    patente: 'DEF456',
    tipo_vehiculo: 'CAMION CHICO',
    estado: 'EN USO',
  })
  await post(`${API_URL}/api/vehiculos`, {
    patente: 'GHI789',
    tipo_vehiculo: 'AUTOMOVIL',
    estado: 'FUERA DE SERVICIO',
  })

  // Obras
  await post(`${API_URL}/api/obras`, {
    cod_obra: 1,
    cod_postal: 2000,
    cuil: '20111111111',
    fecha_ini: '2025-09-01',
    estado: 'ACTIVA',
    direccion: 'Av. Pellegrini 1250, Rosario',
    nota_fabrica:
      'https://res.cloudinary.com/dqiqkfr8z/image/upload/v1759612724/MODELO_Parcial_2_-_para_practicar_-_2025_yr9rpx.pdf',
    nota_fabrica_pid: 'MODELO_Parcial_2_-_para_practicar_-_2025_yr9rpx',
  })
  await post(`${API_URL}/api/obras`, {
    cod_obra: 2,
    cod_postal: 2200,
    cuil: '20222222222',
    fecha_ini: '2025-09-02',
    estado: 'ACTIVA',
    direccion: 'Av. San Martín 850, San Lorenzo',
    nota_fabrica: null,
    nota_fabrica_pid: null,
  })
  await post(`${API_URL}/api/obras`, {
    cod_obra: 3,
    cod_postal: 3000,
    cuil: '20333333333',
    fecha_ini: '2025-09-03',
    estado: 'ACTIVA',
    direccion: 'Bv. Gálvez 1680, Santa Fe',
    nota_fabrica: null,
    nota_fabrica_pid: null,
  })
  await post(`${API_URL}/api/obras`, {
    cod_obra: 4,
    cod_postal: 1900,
    cuil: '20444444444',
    fecha_ini: '2025-09-04',
    estado: 'ACTIVA',
    direccion: 'Calle 7 entre 47 y 48, La Plata',
    nota_fabrica: null,
    nota_fabrica_pid: null,
  })
  await post(`${API_URL}/api/obras`, {
    cod_obra: 5,
    cod_postal: 5000,
    cuil: '20555555555',
    fecha_ini: '2025-09-05',
    estado: 'ACTIVA',
    direccion: 'Av. Colón 4500, Córdoba',
    nota_fabrica:
      'https://res.cloudinary.com/dqiqkfr8z/image/upload/v1759612724/MODELO_Parcial_2_-_para_practicar_-_2025_yr9rpx.pdf',
    nota_fabrica_pid: 'MODELO_Parcial_2_-_para_practicar_-_2025_yr9rpx',
  })
  await post(`${API_URL}/api/obras`, {
    cod_obra: 6,
    cod_postal: 4000,
    cuil: '20666666666',
    fecha_ini: '2025-09-06',
    estado: 'ACTIVA',
    direccion: 'Av. Aconquija 1200, San Miguel de Tucumán',
    nota_fabrica:
      'https://res.cloudinary.com/dqiqkfr8z/image/upload/v1759612724/MODELO_Parcial_2_-_para_practicar_-_2025_yr9rpx.pdf',
    nota_fabrica_pid: 'MODELO_Parcial_2_-_para_practicar_-_2025_yr9rpx',
  })
  // Pagos
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

  // Entregas
  await post(`${API_URL}/api/entregas`, {
    cod_obra: 1,
    fecha_hora_entrega: '2025-09-05T09:00',
    estado: 'PENDIENTE',
    detalle: 'Entrega de aberturas piso 1-3',
    observaciones: 'Verificar medidas antes de instalación',
  })
  await post(`${API_URL}/api/entregas`, {
    cod_obra: 1,
    fecha_hora_entrega: '2025-09-10T14:00',
    estado: 'EN CURSO',
    detalle: 'Entrega parcial piso 4-6',
    observaciones: 'Faltan herrajes de seguridad',
  })
  await post(`${API_URL}/api/entregas`, {
    cod_obra: 2,
    fecha_hora_entrega: '2025-09-12T11:30',
    estado: 'ENTREGADO',
    detalle: 'Entrega completa bloques A y B',
    observaciones: 'Entrega conforme - documentación firmada',
  })
  await post(`${API_URL}/api/entregas`, {
    cod_obra: 2,
    fecha_hora_entrega: '2025-09-15T16:00',
    estado: 'CANCELADO',
    detalle: 'Entrega bloque C',
    observaciones: 'Obra suspendida temporalmente por cliente',
  })
  await post(`${API_URL}/api/entregas`, {
    cod_obra: 3,
    fecha_hora_entrega: '2025-09-18T10:00',
    estado: 'PENDIENTE',
    detalle: 'Aberturas planta baja comercial',
    observaciones: 'Requiere coordinación con electricista',
  })
  await post(`${API_URL}/api/entregas`, {
    cod_obra: 3,
    fecha_hora_entrega: '2025-09-20T13:00',
    estado: 'EN CURSO',
    detalle: 'Mamparas divisorias primer piso',
    observaciones: 'Pendiente entrega de vidrios templados',
  })
  await post(`${API_URL}/api/entregas`, {
    cod_obra: 4,
    fecha_hora_entrega: '2025-09-22T15:30',
    estado: 'ENTREGADO',
    detalle: 'Ventanales fachada principal',
    observaciones: 'Instalación perfecta - cliente satisfecho',
  })
  await post(`${API_URL}/api/entregas`, {
    cod_obra: 5,
    fecha_hora_entrega: '2025-09-25T09:30',
    estado: 'PENDIENTE',
    detalle: 'Puertas principales casas 1-20',
    observaciones: 'Coordinar con paisajista para accesos',
  })
  await post(`${API_URL}/api/entregas`, {
    cod_obra: 5,
    fecha_hora_entrega: '2025-09-28T11:00',
    estado: 'EN CURSO',
    detalle: 'Ventanas casas 21-40',
    observaciones: 'Modificación en color solicitada por cliente',
  })
  await post(`${API_URL}/api/entregas`, {
    cod_obra: 6,
    fecha_hora_entrega: '2025-09-30T17:00',
    estado: 'ENTREGADO',
    detalle: 'Cerramiento integral Torre A',
    observaciones: 'Proyecto finalizado exitosamente',
  })
  // Visitas
  await post(`${API_URL}/api/visitas`, {
    fecha_hora_visita: '2025-09-06T10:00',
    cod_obra: 1,
    motivo_visita: 'MEDICION',
    estado: 'PROGRAMADA',
    observaciones: 'Medición inicial para aberturas piso 1-3',
    direccion_visita: 'Av. Pellegrini 1250, Rosario',
  })
  await post(`${API_URL}/api/visitas`, {
    fecha_hora_visita: '2025-09-07T11:30',
    cod_obra: 2,
    motivo_visita: 'RE-MEDICION',
    estado: 'EN CURSO',
    observaciones: 'Ajuste medidas bloque B por modificación estructural',
    direccion_visita: 'Av. San Martín 850, San Lorenzo',
  })
  await post(`${API_URL}/api/visitas`, {
    fecha_hora_visita: '2025-09-08T09:00',
    cod_obra: 3,
    motivo_visita: 'REPARACION',
    estado: 'COMPLETADA',
    observaciones: 'Reparación marco puerta principal - resuelto',
    direccion_visita: 'Bv. Gálvez 1680, Santa Fe',
  })
  await post(`${API_URL}/api/visitas`, {
    fecha_hora_visita: '2025-09-09T15:00',
    cod_obra: 4,
    motivo_visita: 'ASESORAMIENTO',
    estado: 'CANCELADA',
    observaciones: 'Cliente reprogramó para próxima semana',
    direccion_visita: 'Calle 7 entre 47 y 48, La Plata',
  })
  await post(`${API_URL}/api/visitas`, {
    fecha_hora_visita: '2025-09-10T13:00',
    cod_obra: 2,
    motivo_visita: 'VISITA INICIAL',
    estado: 'PROGRAMADA',
    observaciones: 'Acceso complicado por lluvia - reagendar',
    direccion_visita: 'Av. Colón 4500, Córdoba',
  })
  await post(`${API_URL}/api/visitas`, {
    fecha_hora_visita: '2025-09-11T14:30',
    cod_obra: 6,
    motivo_visita: 'MEDICION',
    estado: 'PROGRAMADA',
    observaciones: 'Medición para cerramiento Torre A',
    direccion_visita: 'Av. Aconquija 1200, San Miguel de Tucumán',
  })
  await post(`${API_URL}/api/visitas`, {
    fecha_hora_visita: '2025-09-12T16:00',
    cod_obra: 1,
    motivo_visita: 'RE-MEDICION',
    estado: 'EN CURSO',
    observaciones: 'Verificar cambios solicitados piso 4-6',
    direccion_visita: 'Av. Pellegrini 1250, Rosario',
  })
  await post(`${API_URL}/api/visitas`, {
    fecha_hora_visita: '2025-09-13T12:00',
    cod_obra: 2,
    motivo_visita: 'REPARACION',
    estado: 'COMPLETADA',
    observaciones: 'Ajuste marcos bloque A - trabajo finalizado',
    direccion_visita: 'Av. San Martín 850, San Lorenzo',
  })
  await post(`${API_URL}/api/visitas`, {
    fecha_hora_visita: '2025-09-14T10:30',
    cod_obra: 3,
    motivo_visita: 'ASESORAMIENTO',
    estado: 'CANCELADA',
    observaciones: 'Arquitecto no disponible - reprogramar',
    direccion_visita: 'Bv. Gálvez 1680, Santa Fe',
  })
  await post(`${API_URL}/api/visitas`, {
    fecha_hora_visita: '2025-09-15T09:30',
    cod_obra: 4,
    motivo_visita: 'VISITA INICIAL',
    estado: 'PROGRAMADA',
    observaciones: 'Feriado local - nueva fecha coordinada',
    direccion_visita: 'Calle 7 entre 47 y 48, La Plata',
  })

  // Órdenes de Producción
  await post(`${API_URL}/api/ordenes-produccion`, {
    cod_obra: 1,
    fecha_confeccion: '2025-09-05',
    fecha_validacion: '2025-09-06',
    url: 'https://docs.sigma-la.com/op-rosario-pellegrini-001.pdf',
    public_id: null,
  })
  await post(`${API_URL}/api/ordenes-produccion`, {
    cod_obra: 1,
    fecha_confeccion: '2025-09-10',
    fecha_validacion: '2025-09-11',
    url: 'https://docs.sigma-la.com/op-rosario-pellegrini-002.pdf',
    public_id: null,
  })
  await post(`${API_URL}/api/ordenes-produccion`, {
    cod_obra: 2,
    fecha_confeccion: '2025-09-12',
    fecha_validacion: '2025-09-13',
    url: 'https://docs.sigma-la.com/op-sanlorenzo-sanmartin-001.pdf',
    public_id: null,
  })
  await post(`${API_URL}/api/ordenes-produccion`, {
    cod_obra: 3,
    fecha_confeccion: '2025-09-15',
    fecha_validacion: '2025-09-16',
    url: 'https://docs.sigma-la.com/op-santafe-galvez-001.pdf',
    public_id: null,
  })
  await post(`${API_URL}/api/ordenes-produccion`, {
    cod_obra: 4,
    fecha_confeccion: '2025-09-18',
    fecha_validacion: '2025-09-19',
    url: 'https://docs.sigma-la.com/op-laplata-calle7-001.pdf',
    public_id: null,
  })

  const relacionesVisitaEmpleado = [
    { cuil: '20999999992', cod_visita: 1 },
    { cuil: '20999999910', cod_visita: 1 },

    { cuil: '20999999992', cod_visita: 2 },
    { cuil: '20999999911', cod_visita: 2 },

    { cuil: '20999999912', cod_visita: 3 },
    { cuil: '20999999913', cod_visita: 3 },

    { cuil: '20999999992', cod_visita: 4 },

    { cuil: '20999999910', cod_visita: 5 },
    { cuil: '20999999914', cod_visita: 5 },

    { cuil: '20999999992', cod_visita: 6 },
    { cuil: '20999999911', cod_visita: 6 },

    { cuil: '20999999913', cod_visita: 7 },
    { cuil: '20999999912', cod_visita: 7 },

    { cuil: '20999999914', cod_visita: 8 },
    { cuil: '20999999910', cod_visita: 8 },

    { cuil: '20999999992', cod_visita: 9 },

    { cuil: '20999999911', cod_visita: 10 },
    { cuil: '20999999913', cod_visita: 10 },
  ]

  // Crear relaciones empleado-visita
  for (const relacion of relacionesVisitaEmpleado) {
    await post(`${API_URL}/api/empleado-visita`, relacion)
  }

  // Relaciones Empleado-Entrega
  const relacionesEntregaEmpleado = [
    {
      cuil: '20999999992',
      cod_entrega: 1,
      cod_obra: 1,
      rol_entrega: 'ENCARGADO',
    },
    {
      cuil: '20999999910',
      cod_entrega: 1,
      cod_obra: 1,
      rol_entrega: 'ACOMPAÑANTE',
    },
    {
      cuil: '20999999911',
      cod_entrega: 1,
      cod_obra: 1,
      rol_entrega: 'ACOMPAÑANTE',
    },
    {
      cuil: '20999999912',
      cod_entrega: 2,
      cod_obra: 1,
      rol_entrega: 'ENCARGADO',
    },
    {
      cuil: '20999999913',
      cod_entrega: 2,
      cod_obra: 1,
      rol_entrega: 'ACOMPAÑANTE',
    },
    {
      cuil: '20999999992',
      cod_entrega: 3,
      cod_obra: 2,
      rol_entrega: 'ENCARGADO',
    },
    {
      cuil: '20999999910',
      cod_entrega: 4,
      cod_obra: 2,
      rol_entrega: 'ENCARGADO',
    },
    {
      cuil: '20999999914',
      cod_entrega: 4,
      cod_obra: 2,
      rol_entrega: 'ACOMPAÑANTE',
    },
    {
      cuil: '20999999911',
      cod_entrega: 4,
      cod_obra: 2,
      rol_entrega: 'ACOMPAÑANTE',
    },
    {
      cuil: '20999999992',
      cod_entrega: 5,
      cod_obra: 3,
      rol_entrega: 'ENCARGADO',
    },
    {
      cuil: '20999999912',
      cod_entrega: 5,
      cod_obra: 3,
      rol_entrega: 'ACOMPAÑANTE',
    },
    {
      cuil: '20999999913',
      cod_entrega: 5,
      cod_obra: 3,
      rol_entrega: 'ACOMPAÑANTE',
    },
    {
      cuil: '20999999911',
      cod_entrega: 6,
      cod_obra: 3,
      rol_entrega: 'ENCARGADO',
    },
    {
      cuil: '20999999914',
      cod_entrega: 6,
      cod_obra: 3,
      rol_entrega: 'ACOMPAÑANTE',
    },
    {
      cuil: '20999999913',
      cod_entrega: 7,
      cod_obra: 4,
      rol_entrega: 'ENCARGADO',
    },
    {
      cuil: '20999999910',
      cod_entrega: 7,
      cod_obra: 4,
      rol_entrega: 'ACOMPAÑANTE',
    },
    {
      cuil: '20999999992',
      cod_entrega: 7,
      cod_obra: 4,
      rol_entrega: 'ACOMPAÑANTE',
    },
    {
      cuil: '20999999914',
      cod_entrega: 8,
      cod_obra: 4,
      rol_entrega: 'ENCARGADO',
    },
    {
      cuil: '20999999992',
      cod_entrega: 9,
      cod_obra: 1,
      rol_entrega: 'ENCARGADO',
    },
    {
      cuil: '20999999912',
      cod_entrega: 9,
      cod_obra: 1,
      rol_entrega: 'ACOMPAÑANTE',
    },
    {
      cuil: '20999999910',
      cod_entrega: 10,
      cod_obra: 2,
      rol_entrega: 'ENCARGADO',
    },
    {
      cuil: '20999999911',
      cod_entrega: 10,
      cod_obra: 2,
      rol_entrega: 'ACOMPAÑANTE',
    },
    {
      cuil: '20999999912',
      cod_entrega: 10,
      cod_obra: 2,
      rol_entrega: 'ACOMPAÑANTE',
    },
    {
      cuil: '20999999913',
      cod_entrega: 10,
      cod_obra: 2,
      rol_entrega: 'ACOMPAÑANTE',
    },
    {
      cuil: '20999999914',
      cod_entrega: 10,
      cod_obra: 2,
      rol_entrega: 'ACOMPAÑANTE',
    },
  ]

  for (const relacion of relacionesEntregaEmpleado) {
    await post(`${API_URL}/api/entrega-empleado`, relacion)
  }

  // Parámetros
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

seed()
  .then(() => console.log('Seed completado con éxito'))
  .catch(e => console.error('Error en seed:', e))
