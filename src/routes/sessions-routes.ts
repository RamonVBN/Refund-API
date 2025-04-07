import { SessionsController } from "@/controllers/sessions-controller";
import { Router } from "express";


export const sessionRoutes = Router()
const controller = new SessionsController()

sessionRoutes.use('/', controller.create)