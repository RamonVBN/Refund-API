
import { Request, Response } from "express";
import {z} from 'zod'
import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/AppError";

export class RefundsController {

    async create(request:Request, response:Response){

        const bodySchema =  z.object({
            name: z.string().trim().min(3),
            category: z.enum(['food', 'others', 'services', 'transport', 'accommodation']),
            amount: z.number().positive({message: "O valor precisa ser positivo."}),
            filename: z.string().min(20)
        })

        const {name, category, amount, filename} = bodySchema.parse(request.body)

        if (!request.user?.id) {
            throw new AppError('Unauthorized', 401)
        }

        const refund = await prisma.refund.create({data: {name, category, amount, filename, userId: request.user.id}})

        return response.status(201).json({refund})
    }

    async index(request:Request, response:Response){

        const querySchema = z.object({
            name: z.string().optional().default(""),
            page: z.coerce.number().optional().default(1),
            perPage: z.coerce.number().optional().default(10),

        })
        

        const {name, page, perPage} = querySchema.parse(request.query)

        const skip = (page - 1) * perPage

        const refunds = await prisma.refund.findMany({
            skip,
            take: perPage,
            where: {
                user: {
                    name:{
                        contains: name.trim()
                    }
                }
            },
            include: {user: true},
            orderBy: {createdAt: 'desc'}
        })

        const totalRecords = await prisma.refund.count({
            where: {
                user: {
                    name:{
                        contains: name.trim()
                    }
                }
            }
        })

        const totalPages = Math.ceil(totalRecords/ perPage)

        return response.json({refunds, pagination: {
            page,
            perPage,
            totalRecords,
            totalPages 
        }})
    }

    async show (request:Request, response:Response){
        const paramsSchema = z.object({
            id: z.string().uuid(),
        })

        const {id} = paramsSchema.parse(request.params)

        const refund = await prisma.refund.findFirst({where: {id}, include: {user: true} })

        return response.json(refund)
    }
}