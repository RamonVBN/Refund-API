import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/AppError";
import { hash } from "bcrypt";
import { Request, Response } from "express";
import {z} from 'zod'


export class UsersController {

    async create(request:Request, response:Response){

        const bodySchema = z.object({
            name: z.string().trim().min(3),
            email: z.string().trim().email().toLowerCase(),
            password: z.string().min(6),
            role: z.enum(['employee', 'manager']).default('employee')

        })

        const {name, email, password, role} = bodySchema.parse(request.body)

        const userWithSameEmail = await prisma.user.findFirst({where: {email}})
        
        if (userWithSameEmail) {
            
            throw new AppError('Já existe um usuário cadastrado com esse e-mail')
        }

        const hashedPassword = await hash(password, 8)

        const new_user = await prisma.user.create({data: {name, email, password: hashedPassword, role}})

        return response.status(201).json(new_user)
    }
}