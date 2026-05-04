import { Router } from 'express'
import { OrdenProduccionController } from './ordenProduccion.controller.js'
import { upload } from '../../shared/middlewares/upload.js'
import { authorize } from '../../shared/middlewares/authorizationRoles.js'

const ordenProduccionController = new OrdenProduccionController()
const ordenProduccionRouter = Router()

ordenProduccionRouter.get('/', ordenProduccionController.getAll)

ordenProduccionRouter.get('/Aprobadas', ordenProduccionController.getAprobadas)

ordenProduccionRouter.get('/en-produccion', ordenProduccionController.getEnProduccion)

ordenProduccionRouter.post('/', upload.single('file'), authorize('OP', 'crear'), ordenProduccionController.create)

ordenProduccionRouter.get('/obra/:cod_obra/finalizada', ordenProduccionController.getByObraAndFinalizada)

ordenProduccionRouter.get('/obra/:cod_obra', ordenProduccionController.getByObra)

ordenProduccionRouter.post('/:cod_op/iniciar', authorize('OP', 'crear'), ordenProduccionController.iniciarProduccion)

ordenProduccionRouter.post('/:cod_op/finalizar', authorize('OP', 'actualizar'), ordenProduccionController.finalizarProduccion)

ordenProduccionRouter.get('/:cod_op', ordenProduccionController.getOne)

ordenProduccionRouter.patch('/:cod_op/aprobar', authorize('OP', 'actualizar'), ordenProduccionController.aprobar)

ordenProduccionRouter.patch('/:cod_op', authorize('OP', 'actualizar'), upload.single('file'), ordenProduccionController.update)

ordenProduccionRouter.delete('/:cod_op', authorize('OP', 'eliminar'), ordenProduccionController.remove)


export default ordenProduccionRouter