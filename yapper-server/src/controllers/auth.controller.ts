import type {Request, Response} from 'express'


const createUser = (req:Request, res:Response) => {
    console.log('Hola :D')
    return res.sendStatus(200)
}