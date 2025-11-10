// This simply combines all the routers into one

import { Router } from "express";
import authRouter from "./auth.route.js";
import friendsRouter from './friends.route.js'
import conversationsRouter from './conversations.route.js'


const api = Router()
api.use('/auth', authRouter)
api.use('/friends', friendsRouter)
api.use('/conversations', conversationsRouter)


export default api