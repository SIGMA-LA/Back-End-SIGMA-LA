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
  // Localidades
  await post(`${API_URL}/api/localidades`, {
    cod_postal: 1000,
    nombre_localidad: 'Ciudad Uno',
  })
  await post(`${API_URL}/api/localidades`, {
    cod_postal: 2000,
    nombre_localidad: 'Ciudad Dos',
  })
  await post(`${API_URL}/api/localidades`, {
    cod_postal: 3000,
    nombre_localidad: 'Ciudad Tres',
  })
  await post(`${API_URL}/api/localidades`, {
    cod_postal: 4000,
    nombre_localidad: 'Ciudad Cuatro',
  })

  // Clientes
  await post(`${API_URL}/api/clientes`, {
    cuil: '20111111111',
    razon_social: 'Cliente Uno',
    telefono: '+54 9 11 1234 5678',
    mail: 'uno@cliente.com',
  })
  await post(`${API_URL}/api/clientes`, {
    cuil: '20222222222',
    razon_social: 'Cliente Dos',
    telefono: '+54 9 11 2345 6789',
    mail: 'dos@cliente.com',
  })
  await post(`${API_URL}/api/clientes`, {
    cuil: '20333333333',
    razon_social: 'Cliente Tres',
    telefono: '+54 9 11 3456 7890',
    mail: 'tres@cliente.com',
  })
  await post(`${API_URL}/api/clientes`, {
    cuil: '20444444444',
    razon_social: 'Cliente Cuatro',
    telefono: '+54 9 11 4567 8901',
    mail: 'cuatro@cliente.com',
  })

  // Empleados - Roles únicos
  const roles = ['ADMIN', 'COORDINACION', 'VISITADOR', 'VENTAS']
  const areas = ['COORDINACION', 'VENTAS', 'PRODUCCION', 'ATENCION_CLIENTE']
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
    estado: 'EN_USO',
  })
  await post(`${API_URL}/api/maquinarias`, {
    cod_maquina: 3,
    descripcion: 'Camión',
    estado: 'MANTENIMIENTO',
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
    estado: 'MANTENIMIENTO',
  })

  // Obras
  await post(`${API_URL}/api/obras`, {
    cod_localidad: 2000,
    cuil: '20111111111',
    fecha_ini: '2025-09-01',
    estado: 'ACTIVA',
    direccion: 'Calle 1',
    nota_fabrica: 'Nota 1',
  })
  await post(`${API_URL}/api/obras`, {
    cod_localidad: 2210,
    cuil: '20222222222',
    fecha_ini: '2025-09-02',
    estado: 'ACTIVA',
    direccion: 'Calle 2',
    nota_fabrica: 'Nota 2',
  })
  await post(`${API_URL}/api/obras`, {
    cod_localidad: 1000,
    cuil: '20333333333',
    fecha_ini: '2025-09-03',
    estado: 'ACTIVA',
    direccion: 'Calle 3',
    nota_fabrica: 'Nota 3',
  })
  await post(`${API_URL}/api/obras`, {
    cod_localidad: 1900,
    cuil: '20444444444',
    fecha_ini: '2025-09-04',
    estado: 'EN PRODUCCION',
    direccion: 'Calle 7 entre 47 y 48',
    nota_fabrica: null,
    nota_fabrica_pid: null,
  })
  await post(`${API_URL}/api/obras`, {
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
    cod_localidad: 400,
    cuil: '20666666666',
    fecha_ini: '2025-09-06',
    estado: 'EN ESPERA DE PAGO',
    direccion: 'Av. Aconquija 1200',
    nota_fabrica:
      'https://res.cloudinary.com/dqiqkfr8z/image/upload/v1759612724/MODELO_Parcial_2_-_para_practicar_-_2025_yr9rpx.pdf',
    nota_fabrica_pid: 'MODELO_Parcial_2_-_para_practicar_-_2025_yr9rpx',
  })

  // Entregas
  await post(`${API_URL}/api/entregas`, {
    cod_obra: 1,
    fecha_hora_entrega: '2025-09-05T09:00',
    estado: 'PENDIENTE',
    detalle: 'Entrega inicial',
    observaciones: 'Preparar documentación',
  })
  await post(`${API_URL}/api/entregas`, {
    cod_obra: 1,
    fecha_hora_entrega: '2025-09-10T14:00',
    estado: 'EN CURSO',
    detalle: 'Entrega parcial',
    observaciones: 'Faltan accesorios',
  })
  await post(`${API_URL}/api/entregas`, {
    cod_obra: 2,
    fecha_hora_entrega: '2025-09-12T11:30',
    estado: 'ENTREGADO',
    detalle: 'Entrega completa',
    observaciones: 'Todo conforme',
  })
  await post(`${API_URL}/api/entregas`, {
    cod_obra: 2,
    fecha_hora_entrega: '2025-09-15T16:00',
    estado: 'CANCELADO',
    detalle: 'Entrega cancelada',
    observaciones: 'Cliente ausente',
  })
  await post(`${API_URL}/api/entregas`, {
    cod_obra: 3,
    fecha_hora_entrega: '2025-09-18T10:00',
    estado: 'PENDIENTE',
    detalle: 'Entrega inicial',
    observaciones: 'Requiere revisión previa',
  })
  await post(`${API_URL}/api/entregas`, {
    cod_obra: 3,
    fecha_hora_entrega: '2025-09-20T13:00',
    estado: 'EN CURSO',
    detalle: 'Entrega parcial',
    observaciones: 'Faltan herrajes',
  })
  await post(`${API_URL}/api/entregas`, {
    cod_obra: 4,
    fecha_hora_entrega: '2025-09-22T15:30',
    estado: 'ENTREGADO',
    detalle: 'Entrega completa',
    observaciones: 'Sin observaciones',
  })
  await post(`${API_URL}/api/entregas`, {
    cod_obra: 4,
    fecha_hora_entrega: '2025-09-25T09:30',
    estado: 'PENDIENTE',
    detalle: 'Entrega adicional',
    observaciones: 'Agregar manuales',
  })
  await post(`${API_URL}/api/entregas`, {
    cod_obra: 1,
    fecha_hora_entrega: '2025-09-28T11:00',
    estado: 'EN CURSO',
    detalle: 'Entrega parcial',
    observaciones: 'Cliente solicita cambio',
  })
  await post(`${API_URL}/api/entregas`, {
    cod_obra: 2,
    fecha_hora_entrega: '2025-09-30T17:00',
    estado: 'ENTREGADO',
    detalle: 'Entrega final',
    observaciones: 'Entrega exitosa',
  })

  // Visitas
  await post(`${API_URL}/api/visitas`, {
    fecha_hora_visita: '2025-09-06T10:00',
    cod_obra: 1,
    motivo_visita: 'MEDICION',
    estado: 'PROGRAMADA',
    observaciones: 'Primera medición',
    direccion_visita: 'Calle 1',
  })
  await post(`${API_URL}/api/visitas`, {
    fecha_hora_visita: '2025-09-07T11:30',
    cod_obra: 2,
    motivo_visita: 'RE-MEDICION',
    estado: 'EN CURSO',
    observaciones: 'Ajuste de medidas',
    direccion_visita: 'Calle 2',
  })
  await post(`${API_URL}/api/visitas`, {
    fecha_hora_visita: '2025-09-08T09:00',
    cod_obra: 3,
    motivo_visita: 'REPARACION',
    estado: 'COMPLETADA',
    observaciones: 'Reparación de marco',
    direccion_visita: 'Calle 3',
  })
  await post(`${API_URL}/api/visitas`, {
    fecha_hora_visita: '2025-09-09T15:00',
    cod_obra: 4,
    motivo_visita: 'ASESORAMIENTO',
    estado: 'CANCELADA',
    observaciones: 'Cliente canceló',
    direccion_visita: 'Calle 4',
  })
  await post(`${API_URL}/api/visitas`, {
    fecha_hora_visita: '2025-09-10T13:00',
    cod_obra: 1,
    motivo_visita: 'VISITA INICIAL',
    estado: 'REPROGRAMADA',
    observaciones: 'Reprogramada por lluvia',
    direccion_visita: 'Calle 1',
  })
  await post(`${API_URL}/api/visitas`, {
    fecha_hora_visita: '2025-09-11T14:30',
    cod_obra: 2,
    motivo_visita: 'MEDICION',
    estado: 'PROGRAMADA',
    observaciones: 'Medición adicional',
    direccion_visita: 'Calle 2',
  })
  await post(`${API_URL}/api/visitas`, {
    fecha_hora_visita: '2025-09-12T16:00',
    cod_obra: 3,
    motivo_visita: 'RE-MEDICION',
    estado: 'EN CURSO',
    observaciones: 'Verificar cambios',
    direccion_visita: 'Calle 3',
  })
  await post(`${API_URL}/api/visitas`, {
    fecha_hora_visita: '2025-09-13T12:00',
    cod_obra: 4,
    motivo_visita: 'REPARACION',
    estado: 'COMPLETADA',
    observaciones: 'Reparación finalizada',
    direccion_visita: 'Calle 4',
  })
  await post(`${API_URL}/api/visitas`, {
    fecha_hora_visita: '2025-09-14T10:30',
    cod_obra: 1,
    motivo_visita: 'ASESORAMIENTO',
    estado: 'CANCELADA',
    observaciones: 'Cliente no disponible',
    direccion_visita: 'Calle 1',
  })
  await post(`${API_URL}/api/visitas`, {
    fecha_hora_visita: '2025-09-15T09:30',
    cod_obra: 2,
    motivo_visita: 'VISITA INICIAL',
    estado: 'REPROGRAMADA',
    observaciones: 'Reprogramada por feriado',
    direccion_visita: 'Calle 2',
  })

  // Órdenes de Producción
  await post(`${API_URL}/api/ordenes-produccion`, {
    cod_obra: 1,
    fecha_confeccion: '2025-09-05',
    fecha_validacion: '2025-09-06',
    url: 'https://docs.luhmann.com/op1.pdf',
  })
  await post(`${API_URL}/api/ordenes-produccion`, {
    cod_obra: 1,
    fecha_confeccion: '2025-09-10',
    fecha_validacion: '2025-09-11',
    url: 'https://docs.luhmann.com/op2.pdf',
  })
  await post(`${API_URL}/api/ordenes-produccion`, {
    cod_obra: 2,
    fecha_confeccion: '2025-09-12',
    fecha_validacion: '2025-09-13',
    url: 'https://docs.luhmann.com/op3.pdf',
  })
  await post(`${API_URL}/api/ordenes-produccion`, {
    cod_obra: 2,
    fecha_confeccion: '2025-09-15',
    fecha_validacion: '2025-09-16',
    url: 'https://docs.luhmann.com/op4.pdf',
  })
  await post(`${API_URL}/api/ordenes-produccion`, {
    cod_obra: 3,
    fecha_confeccion: '2025-09-18',
    fecha_validacion: '2025-09-19',
    url: 'https://docs.luhmann.com/op5.pdf',
  })
  await post(`${API_URL}/api/ordenes-produccion`, {
    cod_obra: 3,
    fecha_confeccion: '2025-09-20',
    fecha_validacion: '2025-09-21',
    url: 'https://docs.luhmann.com/op6.pdf',
  })
  await post(`${API_URL}/api/ordenes-produccion`, {
    cod_obra: 4,
    fecha_confeccion: '2025-09-22',
    fecha_validacion: '2025-09-23',
    url: 'https://docs.luhmann.com/op7.pdf',
  })
  await post(`${API_URL}/api/ordenes-produccion`, {
    cod_obra: 4,
    fecha_confeccion: '2025-09-25',
    fecha_validacion: '2025-09-26',
    url: 'https://docs.luhmann.com/op8.pdf',
  })
  await post(`${API_URL}/api/ordenes-produccion`, {
    cod_obra: 1,
    fecha_confeccion: '2025-09-28',
    fecha_validacion: '2025-09-29',
    url: 'https://docs.luhmann.com/op9.pdf',
  })
  await post(`${API_URL}/api/ordenes-produccion`, {
    cod_obra: 2,
    fecha_confeccion: '2025-09-30',
    fecha_validacion: '2025-10-01',
    url: 'https://docs.luhmann.com/op10.pdf',
  })

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
    fecha_cambio: '2025-09-01',
    hora_cambio: '08:00:00',
    dias_vigencia_presu: 30,
    viatico_dia_persona: 1000,
  })
  await post(`${API_URL}/api/parametros`, {
    cod_parametro: 2,
    fecha_cambio: '2025-09-02',
    hora_cambio: '09:00:00',
    dias_vigencia_presu: 20,
    viatico_dia_persona: 800,
  })
}

seed()
  .then(() => console.log('Seed completado con éxito'))
  .catch(e => console.error('Error en seed:', e))
