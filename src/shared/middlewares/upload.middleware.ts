import { CloudinaryUploader } from './commonUpload/cloudynary.strategy.js'
import { IUploadStrategy } from './commonUpload/iuploadStrategy.js'

let uploadStrategy: IUploadStrategy

const storageProvider = process.env.STORAGE_PROVIDER || 'cloudinary' // 'cloudinary' por defecto

switch (storageProvider.toLowerCase()) {
  case 'cloudinary':
    uploadStrategy = new CloudinaryUploader()
    break

  default:
    throw new Error(`Proveedor de almacenamiento no válido: ${storageProvider}`)
}

// Exportamos el resultado de getUploader(), que es la instancia de Multer lista para usar.
export const upload = uploadStrategy.getUploader()
