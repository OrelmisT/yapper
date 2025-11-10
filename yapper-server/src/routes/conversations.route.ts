import {Router} from 'express'
import requireSession from '../middleware/session.middleware.js'
import db from '../config/db/pg.js'
import type { User } from '../types/types.js'

const router = Router()


router.get('/', requireSession, async (req, res) => {

    try{
        const user_id = req.session.user?.id

        const response =  await db.query(`
                SELECT c.*, JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'id', a.id,
                        'username', a.username,
                        'email', a.email,
                        'pfp_url', a.pfp_url
                    )
                ) AS members
                FROM conversations c JOIN conversation_members cm on c.id = cm.conversation_id 
                JOIN accounts a on cm.member_id = a.id  WHERE c.id IN (
                    SELECT c2.id FROM conversations c2 JOIN conversation_members cm2 on 
                    c2.id = cm2.conversation_id JOIN 
                    accounts a2 ON cm2.member_id = a2.id
                    WHERE a2.id = $1
                ) GROUP BY c.id

            `, [user_id])


        res.status(200).json({"conversations": response.rows})

        return

    }catch(e){
        console.log(e)
        res.status(500).json({"error_message":"internal server error"})
        return
    }

})



router.post('/', requireSession, async (req, res) => {
    try{
        const {members, name} = req.body
        const conversation_name = name || ''
        const isGroup = members.length > 2

        const convoRes = await db.query('insert into conversations(name, is_group) values($1, $2) returning *', [conversation_name, isGroup])

        const conversation = convoRes.rows[0]


        await Promise.all(members.map((user:User) => {

            return db.query('insert into conversation_members(conversation_id, member_id) values($1, $2)', [conversation.id, user.id])
        }))

        res.status(201).json({"conversation": {...conversation, members}})
        
    }catch(e){
        console.log(e)
        res.status(500).json({"error_message": "internal server error"})
    }


})




export default router