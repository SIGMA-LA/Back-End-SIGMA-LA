import multer from 'multer'
import { IUploadStrategy } from './iuploadStrategy.js'

/**
 * Estrategia de almacenamiento local usando memoria.
 * Utilizada en entornos de desarrollo y testing donde no se dispone
 * de un proveedor de almacenamiento externo (Cloudinary, S3, etc.).
 */
export class LocalUploader implements IUploadStrategy {
  getUploader(): multer.Multer {
    return multer({ storage: multer.memoryStorage() })
  }

  async deleteFile(_publicId: string): Promise<void> {
    // No-op en almacenamiento local
  }
}
