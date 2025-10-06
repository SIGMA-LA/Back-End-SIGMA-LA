import { v2 as cloudinary } from 'cloudinary'
import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import { IUploadStrategy } from './iuploadStrategy.js'

export class CloudinaryUploader implements IUploadStrategy {
  private uploader: multer.Multer

  constructor() {
    // 1. Validar que las credenciales existan
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      throw new Error(
        'Las credenciales de Cloudinary no están definidas en las variables de entorno.',
      )
    }

    // 2. Configurar el SDK de Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })

    // 3. Configurar el motor de almacenamiento para multer
    const storage = new CloudinaryStorage({
      cloudinary,
      params: async () => {
        return {
          folder: 'sigma-la-uploads',
          allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'webp'],
          transformation: [{ width: 500, height: 500, crop: 'limit' }],
        }
      },
    })

    // 4. Crear la instancia de Multer con el almacenamiento de Cloudinary
    this.uploader = multer({ storage })
  }

  /**
   * Devuelve la instancia de Multer configurada para Cloudinary.
   */
  public getUploader(): multer.Multer {
    return this.uploader
  }
  /**
   * Elimina un archivo de Cloudinary usando su public_id.
   */
  public async deleteFile(publicId: string): Promise<any> {
    return cloudinary.uploader.destroy(publicId)
  }
}
