import Papa from 'papaparse'
import fs from 'fs/promises'

const API_URL = 'http://localhost:4000'

interface LocalidadCSV {
  IDProvincia: number
  NombreLocalidad: string
}

interface Provincia {
  cod: number
  nombre: string
}

const provincias: Provincia[] = [
  { cod: 1, nombre: 'Buenos Aires' },
  { cod: 2, nombre: 'Capital Federal' },
  { cod: 3, nombre: 'Catamarca' },
  { cod: 4, nombre: 'Chaco' },
  { cod: 5, nombre: 'Chubut' },
  { cod: 6, nombre: 'Cordoba' },
  { cod: 7, nombre: 'Corrientes' },
  { cod: 8, nombre: 'Entre Rios' },
  { cod: 9, nombre: 'Formosa' },
  { cod: 10, nombre: 'Jujuy' },
  { cod: 11, nombre: 'La Pampa' },
  { cod: 12, nombre: 'La Rioja' },
  { cod: 13, nombre: 'Mendoza' },
  { cod: 14, nombre: 'Misiones' },
  { cod: 15, nombre: 'Neuquen' },
  { cod: 16, nombre: 'Rio Negro' },
  { cod: 17, nombre: 'Salta' },
  { cod: 18, nombre: 'San Juan' },
  { cod: 19, nombre: 'San Luis' },
  { cod: 20, nombre: 'Santa Cruz' },
  { cod: 21, nombre: 'Santa Fe' },
  { cod: 22, nombre: 'Santiago del Estero' },
  { cod: 23, nombre: 'Tierra del Fuego' },
  { cod: 24, nombre: 'Tucuman' },
]

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

async function seedLocalidades() {
  // Crear provincias
  for (const provincia of provincias) {
    try {
      await post(`${API_URL}/api/provincias`, {
        cod_provincia: provincia.cod,
        nombre: provincia.nombre,
      })
    } catch (error) {
      console.error(`Error al crear provincia ${provincia.nombre}:`, error)
    }
  }
  console.log('Provincias completadas\n')

  // Leer y procesar localidades desde CSV
  const csvContent = await fs.readFile('src/shared/db/localidades.csv', 'utf-8')

  const parseResult = Papa.parse<LocalidadCSV>(csvContent, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
    transformHeader: (header: string): string => header.trim(),
  })

  if (parseResult.errors.length > 0) {
    console.error('Errores al parsear CSV:', parseResult.errors)
  }

  console.log(`Procesando ${parseResult.data.length} localidades...`)

  // Postear cada localidad
  for (const row of parseResult.data) {
    const idProvincia = row.IDProvincia
    const nombreLocalidad = row.NombreLocalidad

    if (idProvincia !== undefined && nombreLocalidad) {
      try {
        await post(`${API_URL}/api/localidades`, {
          cod_provincia: idProvincia,
          nombre_localidad: nombreLocalidad.trim(),
        })
      } catch (error) {
        console.error(`✗ Error al crear ${nombreLocalidad}:`, error)
      }
    } else {
      console.warn('Fila inválida:', row)
    }
  }
}
seedLocalidades()
  .then(() => console.log('Seed completado con éxito'))
  .catch(e => console.error('Error en seed:', e))
