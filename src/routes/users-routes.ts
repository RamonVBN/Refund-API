import { UsersController } from "@/controllers/users-controller";
import { Router } from "express";


export const usersRoutes = Router()
const controller = new UsersController()

usersRoutes.post('/', controller.create)

