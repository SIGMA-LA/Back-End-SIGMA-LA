import { Router } from 'express'
import { OrdenProduccionController } from './ordenProduccion.controller.js'
import { upload } from '../../shared/middlewares/upload.middleware.js'

const ordenProduccionController = new OrdenProduccionController()
const ordenProduccionRouter = Router()

ordenProduccionRouter.get('/', ordenProduccionController.getAll)

ordenProduccionRouter.get('/validadas', ordenProduccionController.getValidadas)

ordenProduccionRouter.get('/en-produccion', ordenProduccionController.getEnProduccion)

ordenProduccionRouter.post('/', upload.single('file'), ordenProduccionController.create)

ordenProduccionRouter.get('/obra/:cod_obra/finalizada', ordenProduccionController.getByObraAndFinalizada)

ordenProduccionRouter.get('/obra/:cod_obra', ordenProduccionController.getByObra)

ordenProduccionRouter.post('/:cod_op/iniciar', ordenProduccionController.iniciarProduccion)

ordenProduccionRouter.post('/:cod_op/finalizar', ordenProduccionController.finalizarProduccion)

ordenProduccionRouter.get('/:cod_op', ordenProduccionController.getOne)

ordenProduccionRouter.put('/:cod_op', ordenProduccionController.update)

ordenProduccionRouter.delete('/:cod_op', ordenProduccionController.remove)


export default ordenProduccionRouter