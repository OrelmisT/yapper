// This simply combines all the routers into one

import { Router } from "express";
import authRouter from "./auth.route.js";


const api = Router()
api.use('/auth', authRouter)


export default api