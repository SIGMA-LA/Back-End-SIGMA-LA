import { Request, Response, Router } from 'express'
import { upload } from '../../shared/middlewares/upload.middleware.js'

const routeMid = Router()

routeMid.post('/', upload.single('file'), (req: Request, res: Response) => {
  try {
    // 1. Manejo del archivo
    console.log('Información del archivo subido:', req.file)

    if (!req.file) {
      return res
        .status(400)
        .json({ message: 'Error: No se ha subido ningún archivo.' })
    }

    // 'req.file.path' contiene la URL segura de Cloudinary gracias a multer-storage-cloudinary
    const imageUrl = req.file.path

    console.log(imageUrl)
    // 3. Lógica de negocio (aquí llamarías a tu servicio)
    // Ejemplo:
    // const newProduct = await productService.create({ name, price, imageUrl });

    res.status(201).json({
      message: 'Producto creado y archivo subido con éxito!',
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error interno del servidor.' })
  }
})

export default routeMid
