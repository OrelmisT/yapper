import { response, Router } from "express";
import db from "../config/db/pg.js";
import config from "../config/config.js";
import bcrypt from 'bcrypt'
import requireSession from "../middleware/session.middleware.js";
import s3Client from "../config/s3/s3.config.js"
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";


const authRouter = Router()

// authRouter.get('/whoAmI')

authRouter.get('/whoami', async(req, res) => {
    try{
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
        res.status(500).json({"error_message":"internal server error."})
        return
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

      

        req.session.user = new_user
        res.status(201).json({"message":"Account successfully created.", "user":new_user})
        return
        
    }catch(e){
        console.log(e)
        res.status(500).json({"error_message": "internal server error."})
        return

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
        res.status(500).json({"error_message": "internal server error."})
        return
    }
})




authRouter.post('/logout', async(req, res) => {
    try{
        req.session.destroy((err) => {
            if(err){
                console.log(err)
                res.status(500).json({"error_message": "internal server error"})
                return
            }

            res.status(200).clearCookie('connect.sid').json({"message": "Successfully logged out."})
            return
        })

    }catch(e){
        console.log(e)
        res.status(500).json({"error_message":"internal server error"})
        return
    }

})


authRouter.get('/pfp_upload_url', requireSession, async(req, res) => {
    try{
        const contentType = req.query.contentType as string
        const user_id = req.session.user?.id
        const file_key = `user_${user_id}_pfp`
        const command = new PutObjectCommand({
            Bucket: config.s3.bucket,
            Key: file_key,
            ContentType:contentType,   
        });

        const pfp_upload_url = await getSignedUrl(s3Client, command, {expiresIn: 3600})
        res.status(200).json({"pfp_upload_url": pfp_upload_url, "file_key": file_key})
        return


    }catch(e){
        console.log(e)
        res.status(500).json({"error_message":"internal server error"})
        return 
    }
})


authRouter.put('/update_account', requireSession, async(req, res) => {
    try{
        const {email, username, new_pfp} = req.body
        const user_id = req.session.user?.id

        let update_res = null
        
        if(!new_pfp){
            update_res = await db.query('update accounts set email = $1, username = $2 where id = $3 returning *', [email, username, user_id])
        }else{

            const pfp_url =`${config.s3.pfp_url_prefix}/user_${user_id}_pfp`
            update_res = await db.query('update accounts set email = $1, username = $2, pfp_url = $3 where id = $4 returning *', [email, username, pfp_url, user_id])
        }

        const updated_user = update_res.rows[0]
        req.session.user = updated_user
        res.status(200).json({"message":"Account successfully updated.", "user": updated_user})
        return 
    }catch(e){
        console.log(e)
        res.status(500).json({"error_message":"internal server error"})
        return
    }
})


authRouter.put('/reset_passord_logged_in', requireSession, async (req, res) => {
    try{
        const userId = req.session.user?.id
        const {current_password, new_password} = req.body

        console.log(`current password: ${current_password}, new password: ${new_password}`)

        // First check if the password is correct
        const passwordResult = await db.query('select password from accounts a where a.id = $1', [userId])
        const hashedPassword = passwordResult.rows[0].password
        const passwordIsCorrect = await bcrypt.compare(current_password, hashedPassword)
        if(!passwordIsCorrect){
            res.status(401).json({"error_message":"incorrect password"})
            return 
        }

        const newHashedPassword = await bcrypt.hash(new_password, config.salt_rounds || config.salt_rounds ? parseInt(config.salt_rounds) : 10)

        await db.query('update accounts set password = $1 where accounts.id = $2', [newHashedPassword, userId])
        
        res.status(200).json({"message":"password updated successfully"})
        return

    }catch(e){
        console.log(e)
        res.status(500).json({"error_message":"internal server error"})
        return 
    }
})


export default authRouter