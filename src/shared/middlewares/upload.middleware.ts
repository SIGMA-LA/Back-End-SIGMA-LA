import { CloudinaryUploader } from './commonUpload/cloudynary.strategy.js'
import { LocalUploader } from './commonUpload/local.strategy.js'
import { IUploadStrategy } from './commonUpload/iuploadStrategy.js'
import { env } from '../../config/env.js'

let uploadStrategy: IUploadStrategy

switch (env.STORAGE_PROVIDER.toLowerCase()) {
  case 'cloudinary':
    uploadStrategy = new CloudinaryUploader()
    break

  case 'local':
    uploadStrategy = new LocalUploader()
    break

  default:
    throw new Error(
      `Proveedor de almacenamiento no válido: ${env.STORAGE_PROVIDER}`,
    )
}

// Exportamos el resultado de getUploader(), que es la instancia de Multer lista para usar.
export const upload = uploadStrategy.getUploader()
export const deleteUploadedFile = (publicId: string) =>
  uploadStrategy.deleteFile(publicId)
