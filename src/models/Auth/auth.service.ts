import { EmpleadoRepository } from '../Empleado/empleado.repository.js'
import { empleado } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET as string
const JWT_EXPIRES_IN = '8h'

if (!JWT_SECRET) {
  throw new Error('La variable de entorno JWT_SECRET no está definida.')
}

/**
 * Servicio para manejar la autenticación de empleados.
 * @class AuthService
 * @method register - Registra un nuevo empleado (visitador) con contraseña encriptada.
 * @method login - Valida credenciales y genera JWT.
 * @method verifyPassword - Compara contraseñas.
 * @method generateToken - Genera un JWT con id y rol.
 */
export class AuthService {
  private empleadoRepository: EmpleadoRepository

  constructor() {
    this.empleadoRepository = new EmpleadoRepository()
  }

  /**
   * Registra un nuevo empleado (visitador) con contraseña encriptada.
   * @param {object} data - Datos del empleado (cuil, nombre, apellido, rol_actual, area_trabajo, contrasenia)
   * @returns {Promise<empleado>} - Empleado creado
   */
  async register(data: {
    cuil: string
    nombre: string
    apellido: string
    rol_actual: string
    area_trabajo: string
    contrasenia: string
  }): Promise<empleado> {
    const hashedPassword = await bcrypt.hash(data.contrasenia, 10)
    return await this.empleadoRepository.create({
      ...data,
      contrasenia: hashedPassword,
    })
  }

  /**
   * Inicia sesión validando credenciales y genera JWT.
   * @param {bigint} cuil - CUIL del empleado
   * @param {string} contrasenia - Contraseña en texto plano
   * @returns {Promise<{ token: string, empleado: empleado }>} - JWT y datos del empleado
   */
  async login(
    cuil: string,
    contrasenia: string,
  ): Promise<{ token: string; empleado: empleado }> {
    const empleado = await this.empleadoRepository.findByCuil(cuil)
    if (!empleado || !empleado.contrasenia) {
      throw new Error('Credenciales inválidas')
    }
    const isValid = await this.verifyPassword(contrasenia, empleado.contrasenia)
    if (!isValid) {
      throw new Error('Credenciales inválidas')
    }
    const token = this.generateToken(empleado)
    return { token, empleado }
  }

  /**
   * Compara la contraseña ingresada con la almacenada.
   * @param {string} plain - Contraseña en texto plano
   * @param {string} hash - Contraseña encriptada
   * @returns {Promise<boolean>} - true si coinciden
   */
  async verifyPassword(plain: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(plain, hash)
  }

  /**
   * Genera un JWT con el id y rol del empleado.
   * @param {empleado} empleado - Datos del empleado
   * @returns {string} - JWT
   */
  generateToken(empleado: empleado): string {
    return jwt.sign(
      {
        cuil: empleado.cuil,
        rol_actual: empleado.rol_actual,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    )
  }
}
