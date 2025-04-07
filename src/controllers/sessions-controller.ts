import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/AppError";
import { compare } from "bcrypt";
import { Request, Response } from "express";
import {z} from 'zod'
import { sign } from "jsonwebtoken";
import { authConfig } from "@/configs/auth";

export class SessionsController {

    async create(request:Request, response:Response){

        const bodySchema = z.object({
            email: z.string().email(),
            password: z.string().min(6)
        })

        const {email, password} = bodySchema.parse(request.body)

        const user = await prisma.user.findUnique({where: {email}})

        if (!user) {
            
            throw new AppError('Email ou senha inválido.')
        }

        const {password: hashedPassword} = user

        const passwordMatched = await compare(password, hashedPassword)

        if (!passwordMatched) {
            
            throw new AppError('Email ou senha inválido.')
        }

        const token = sign({role: user.role}, authConfig.jwt.secret,
            {
                subject: user.id,
                expiresIn: authConfig.jwt.expiresIn
            }
        )

        const {password: _, ...userWithoutPassword} = user
    

        return response.status(201).json({token, userWithoutPassword})
    }
}