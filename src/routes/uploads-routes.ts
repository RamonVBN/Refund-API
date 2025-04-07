import { Router } from "express";
import { UploadsController } from "@/controllers/uploads-controller";
import { verifyAuthorization } from "@/middlewares/verifyAuthorization";

import multer from 'multer'
import uploadConfig from "@/configs/upload"



export const uploadsRoutes = Router()
const controller = new UploadsController()

const upload = multer(uploadConfig.MULTER)

uploadsRoutes.use(verifyAuthorization(['employee'])) 
uploadsRoutes.post('/', upload.single('file'), controller.create) 
