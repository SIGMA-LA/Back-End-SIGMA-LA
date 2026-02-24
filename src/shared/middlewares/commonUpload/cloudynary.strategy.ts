import { v2 as cloudinary } from 'cloudinary'
import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import { IUploadStrategy } from './iuploadStrategy.js'
import { env } from '../../../config/env.js'

export class CloudinaryUploader implements IUploadStrategy {
  private uploader: multer.Multer

  constructor() {
    // Configurar el SDK de Cloudinary
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
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
  public async deleteFile(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId)
  }
}
