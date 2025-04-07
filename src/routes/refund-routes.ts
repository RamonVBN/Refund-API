import { RefundsController } from "@/controllers/refunds-controller";
import { verifyAuthorization } from "@/middlewares/verifyAuthorization";
import { Router } from "express";


export const refundsRoutes = Router()
const controller = new RefundsController()

refundsRoutes.post('/', verifyAuthorization(['employee']), controller.create)

refundsRoutes.get('/', verifyAuthorization(['manager']), controller.index)
refundsRoutes.get('/:id', verifyAuthorization(['manager', 'employee']), controller.show)
