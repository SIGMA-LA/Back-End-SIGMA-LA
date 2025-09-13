import { object, pipe, string, transform } from 'valibot'

// Schema para validar ID numérico en params
export const idParamsSchema = object({
  id: pipe(string('El ID debe ser un string'), transform(Number)),
})

// Schema para validar CUIL en params
export const cuilParamsSchema = object({
  cuil: pipe(
    string('El CUIL debe ser un string'),
    transform(value => BigInt(value as string)),
  ),
})
