import { Router } from "express";
import { usersRoutes } from "./users-routes";
import { sessionRoutes } from "./sessions-routes";
import { refundsRoutes } from "./refund-routes";

import { authenticate } from "@/middlewares/authenticate";
import { uploadsRoutes } from "./uploads-routes";


export const routes = Router()


// Rotas públicas
routes.use('/users', usersRoutes)
routes.use('/sessions', sessionRoutes)

// Rotas privadas
routes.use(authenticate)
routes.use('/refunds', refundsRoutes)
routes.use('/uploads', uploadsRoutes)

