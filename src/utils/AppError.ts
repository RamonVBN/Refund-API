

export class AppError {

    constructor(message:string, statusCode:number = 400){

        this.message = message
        this.statusCode = statusCode
    }

    message: string
    statusCode:number

}