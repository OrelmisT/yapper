import type { Request, Response, NextFunction } from "express"

const requireSession = (req:Request, res: Response, next:NextFunction) =>{

    if(req.session.user){
        next()
        return
    }else{
        res.status(401).json({"error_msg":"User session invalid or expired"})
        return
    }


}

export default requireSession