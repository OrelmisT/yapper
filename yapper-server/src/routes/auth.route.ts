import { response, Router } from "express";
import db from "../config/db/pg.js";
import config from "../config/config.js";
import bcrypt from 'bcrypt'


const authRouter = Router()

// authRouter.get('/whoAmI')

authRouter.get('/whoami', async(req, res) => {
    try{

        console.log(req.session.user)

        if(!req.session.user){
            res.status(401).json({"message":"Invalid or expired token."})
            return
        }
        const {email} = req.session.user
        const response = await db.query('select * from accounts where email = $1', [email])
        if(response.rowCount === 0){
            res.status(401).json({"message": "No account associated with this session."})
            return 
        }
        res.status(200).json({"message": "Valid session", "user": response.rows[0]})
        return

    }
    catch(e){
        console.log(e)
        res.status(500).json({"message":"Internal server error."})
    }
})


authRouter.post('/signup', async (req, res) => {

    

    try{  
        const {email, username, password} = req.body
        
        const prev_users = await db.query('select * from accounts where email = $1 or username = $2', [email, username])
        if((prev_users.rowCount ?? 0) > 0){
            res.status(409).json({'error_message':'Username or Email already in use.'})
            return
        }
        
        const hashed_password = await bcrypt.hash(password, config.salt_rounds ? parseInt(config.salt_rounds) : 10)
        
        const new_user_resp = await db.query('insert into accounts(username,email,password,pfp_url) values ($1, $2, $3, $4) returning *', [username, email, hashed_password, ''])
        const new_user = new_user_resp.rows[0]

        console.log(new_user)

        req.session.user = new_user
        res.status(201).json({"message":"Account successfully created.", "user":new_user})
        return
        
    }catch(e){
        console.log(e)
        res.status(500).json({"message": "Internal server error."})

    }

})


authRouter.post('/login', async(req, res) => {    
    try{
        const {email, password} = req.body

        //check if account exists
        const response = await db.query('select * from accounts where email = $1', [email])
        if(response.rowCount === 0){
            res.status(401).json({"message": "Invalid email or password."})
            return 
        }

        const user = response.rows[0]
        const correct_password = await bcrypt.compare(password, user.password)
        if(!correct_password){
            res.status(401).json({"message": "Invalid email or password."})
            return
        }

        req.session.user = user
        res.status(200).json({"message": "Successfully logged in.", user})
        return


    }catch(e){
        console.log(e)
        res.status(500).json({"message": "Internal server error."})
    }
})


authRouter.post('/logout', async(req, res) => {
    try{
        req.session.destroy((err) => {
            if(err){
                console.log(err)
                res.status(500).json({"message": "Internal server error"})
                return
            }

            res.status(200).clearCookie('connect.sid').json({"message": "Successfully logged out."})
        })

    }catch(e){
        console.log(e)
        res.status(500).json({"message":"Internal server error"})
    }

})



export default authRouter