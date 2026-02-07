import {Router} from "express";
import requireSession from "../middleware/session.middleware.js";
import { whoAmI, signUp, login, logout, pfpUpload, updateAccount, resetPasswordLoggedIn} from "../controllers/auth.controller.js";

const authRouter = Router()

authRouter.get('/whoami', whoAmI)

authRouter.post('/signup', signUp)

authRouter.post('/login', login)

authRouter.post('/logout', logout)

authRouter.get('/pfp_upload_url', requireSession, pfpUpload)

authRouter.put('/update_account', requireSession, updateAccount)

authRouter.put('/reset_passord_logged_in', requireSession, resetPasswordLoggedIn)


export default authRouter