import multer from 'multer'

/**
 * Interfaz que define el contrato para cualquier estrategia de subida de archivos.
 * Cada proveedor (Cloudinary, S3, etc.) deberá implementar esta interfaz.
 */
export interface IUploadStrategy {
  /**
   * Devuelve una instancia de Multer configurada con el motor de almacenamiento
   * específico del proveedor.
   */
  getUploader(): multer.Multer
}
