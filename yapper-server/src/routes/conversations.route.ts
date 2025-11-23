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
                ) GROUP BY c.id ORDER BY c.last_modified DESC

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


router.get('/:conversationId/messages', requireSession, async (req, res) => {

    try{
        // first check if the user is a member of this conversation, and if the convo even exists
        const userId = req.session.user?.id
        const conversationId = req.params.conversationId
        const result = await db.query('select * from accounts a JOIN conversation_members cm on a.id = cm.member_id JOIN conversations c on c.id = cm.conversation_id where a.id = $1 and c.id = $2', [userId, conversationId])

        if(result.rowCount === 0){
            res.status(403).json({"error_message":"The conversation either doesn't exist or the user is not a member"})
            return 
        }

        // fetch messages
        const messagesResult = await db.query('select * from messages m where m.conversation_id = $1 ORDER BY m.timestamp', [conversationId])
        const messages = messagesResult.rows

        res.status(200).json({"messages":messages})
        return 
    }catch(e){
        console.log(e)
        res.status(500).json({"error_message":"internal server error"})
        return
    }
    

})


router.post('/:conversationId/messages', requireSession, async (req, res) => {
    try{

        // check if conversation exists and if user is a member
        const userId = req.session.user?.id
        const conversationId = req.params.conversationId

        const result = await db.query('select * from accounts a JOIN conversation_members cm on a.id = cm.member_id JOIN conversations c on c.id = cm.conversation_id where a.id = $1 and c.id = $2', [userId, conversationId])

        if(result.rowCount === 0){
            res.status(403).json({"error_message":"The conversation either doesn't exist or the user is not a member"})
            return 
        }

        const {content, type} = req.body

        const insert_result = await db.query('insert into messages(conversation_id, sender_id, content, type) values ($1, $2, $3, $4) returning *', [conversationId, userId, content,type])

        await db.query('update conversations SET last_modified = $1 where id = $2', [insert_result.rows[0].timestamp, conversationId])

        res.status(201).json({'message':insert_result.rows[0]})
        return


    }catch(e){
        console.log(e)
        res.status(500).json({"error_message":"internal server error"})
        return 
    }


})




export default router