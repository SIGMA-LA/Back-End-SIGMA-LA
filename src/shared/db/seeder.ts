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

  // Empleados
  const roles = ['ADMIN', 'COORDINACION', 'ENCARGADO', 'VISITADOR', 'VENTAS']
  const areas = ['COORDINACION', 'VENTAS', 'PRODUCCION', 'CORTE', 'MECANIZADO']
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
  await post(`${API_URL}/api/empleados`, {
    cuil: `20999999997`,
    nombre: 'Extra',
    apellido: 'Empleado',
    rol_actual: 'ADMIN',
    area_trabajo: 'ALMACEN',
    contrasenia: 'test1234',
  })
  await post(`${API_URL}/api/empleados`, {
    cuil: `20999999998`,
    nombre: 'Adicional',
    apellido: 'Empleado',
    rol_actual: 'VENTAS',
    area_trabajo: 'ATENCION_CLIENTE',
    contrasenia: 'test1234',
  })

  // Maquinarias (usar estados válidos)
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

  // Vehiculos (usar tipos y estados válidos, patentes válidas)
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

  // Obras (estado: cualquier string no vacío, fecha_ini formato YYYY-MM-DD)
  await post(`${API_URL}/api/obras`, {
    cod_obra: 1,
    cod_postal: 1000,
    cuil: '20111111111',
    fecha_ini: '2025-09-01',
    estado: 'ACTIVA',
    direccion: 'Calle 1',
    nota_fabrica: 'Nota 1',
  })
  await post(`${API_URL}/api/obras`, {
    cod_obra: 2,
    cod_postal: 2000,
    cuil: '20222222222',
    fecha_ini: '2025-09-02',
    estado: 'ACTIVA',
    direccion: 'Calle 2',
    nota_fabrica: 'Nota 2',
  })
  await post(`${API_URL}/api/obras`, {
    cod_obra: 3,
    cod_postal: 3000,
    cuil: '20333333333',
    fecha_ini: '2025-09-03',
    estado: 'ACTIVA',
    direccion: 'Calle 3',
    nota_fabrica: 'Nota 3',
  })
  await post(`${API_URL}/api/obras`, {
    cod_obra: 4,
    cod_postal: 4000,
    cuil: '20444444444',
    fecha_ini: '2025-09-04',
    estado: 'ACTIVA',
    direccion: 'Calle 4',
    nota_fabrica: 'Nota 4',
  })

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
  await post(`${API_URL}/api/parametros`, {
    cod_parametro: 3,
    fecha_cambio: '2025-09-03',
    hora_cambio: '10:00:00',
    dias_vigencia_presu: 15,
    viatico_dia_persona: 500,
  })
}

seed()
  .then(() => console.log('Seed completado con fetch'))
  .catch(e => console.error('Error en seed:', e))
