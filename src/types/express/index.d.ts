import { JwtPayload } from 'jsonwebtoken'

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & { cuil?: string; rol_actual?: string }
    }
  }
}
