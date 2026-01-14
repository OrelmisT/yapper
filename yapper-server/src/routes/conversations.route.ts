import {Router} from 'express'
import requireSession from '../middleware/session.middleware.js'
import db from '../config/db/pg.js'
import type { User } from '../types/types.js'
import s3Client from "../config/s3/s3.config.js"
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import config from '../config/config.js'

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

        const lastReadTimestampResponse = await db.query(`
                SELECT lrts.conversation_id as conversation_id, lrts.last_read_timestamp as last_read_timestamp
                FROM last_read_timestamps lrts where user_id = $1 
            `, [user_id])

        const last_read_timestamps = lastReadTimestampResponse.rows


        res.status(200).json({"conversations": response.rows, last_read_timestamps})

        return

    }catch(e){
        console.log(e)
        res.status(500).json({"error_message":"internal server error"})
        return
    }

})



router.post('/', requireSession, async (req, res) => {
    try{
        const {members, name, init_message} = req.body
        const conversation_name = name || ''
        const isGroup = members.length > 2

        const convoRes = await db.query('insert into conversations(name, is_group) values($1, $2) returning *', [conversation_name, isGroup])

        const conversation = convoRes.rows[0]


        await Promise.all(members.map((user:User) => {

            return db.query('insert into conversation_members(conversation_id, member_id) values($1, $2)', [conversation.id, user.id])
        }))

        if(init_message && init_message.content.length > 0){
            const {content, type} = init_message
            const sender = req.session.user
            await db.query('insert into messages(conversation_id, sender_id, content, type) values ($1, $2, $3, $4)', [conversation.id, sender?.id, content, type])
        
        }

        res.status(201).json({"conversation": {...conversation, members}})
        
    }catch(e){
        console.log(e)
        res.status(500).json({"error_message": "internal server error"})
    }


})


router.get('/:conversationId/messages', requireSession, async (req, res) => {

    try{
        console.log(req.body)
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


router.put('/:conversationId/last_read', requireSession, async (req, res) => {
    try{
        const userId = req.session.user?.id
        const conversationId = req.params.conversationId
        const {last_read_timestamp} = req.body

        await db.query('Insert into last_read_timestamps (user_id, conversation_id, last_read_timestamp) values ($1, $2, $3) ON CONFLICT (user_id, conversation_id) DO update set last_read_timestamp = $3', [userId, conversationId, last_read_timestamp])

        res.status(200).json({"message":"last read timestamp updated"})
        return
    }
    catch(e){
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

        let messages = req.body.messages
        messages = messages.map((msg:{content:string, type:string}) => msg.type === 'image'? {...msg, content: `${config.s3.pfp_url_prefix}/${msg.content}`}: msg)

        const responses = await Promise.all(messages.map((message:{content:string, type:string}) =>{
            return db.query('insert into messages(conversation_id, sender_id, content, type) values ($1, $2, $3, $4) returning *', [conversationId, userId, message.content, message.type])
        }))
        const newMessages = responses.map((r) => r.rows[0])

        // const {content, type} = req.body

        // const insert_result = await db.query('insert into messages(conversation_id, sender_id, content, type) values ($1, $2, $3, $4) returning *', [conversationId, userId, content,type])

        await db.query('update conversations SET last_modified = $1 where id = $2', [newMessages[newMessages.length - 1].timestamp, conversationId])
        await db.query('Insert into last_read_timestamps (user_id, conversation_id, last_read_timestamp) values ($1, $2, $3) ON conflict (user_id, conversation_id) DO update set last_read_timestamp = $3', [userId, conversationId, newMessages[newMessages.length -1].timestamp])

        res.status(201).json({'messages':newMessages})
        return


    }catch(e){
        console.log(e)
        res.status(500).json({"error_message":"internal server error"})
        return 
    }


})



router.put('/:conversationId', requireSession, async (req, res) => {

    try{

        const conversationId = req.params.conversationId
        const {name} = req.body
        const findConvoRes = await db.query('select * from conversations where id = $1', [conversationId])
        if(findConvoRes.rowCount ===0){
            res.status(404).json({"error_message":"conversation not found"})
            return
        }

        const updateRes = await db.query('update conversations set name = $1 where id = $2 returning *', [name, conversationId])
        const newConvo = updateRes.rows[0]

        res.status(200).json({"updated_conversation": newConvo})
        return

    }catch(e){
        console.log(e)
        res.status(500).json({"error_message":"internal server error"})
        return 
    }


})


router.post(('/message_image_upload_urls'), requireSession, async (req, res) => {
    try{
        const contentTypes = req.body.contentTypes as string[]
        const keys:string[] = []


        const commands = contentTypes.map((type) =>{
            const key = `message_images/${Date.now().toString()}_${Math.random().toString(36).substring(2,15)}`
            keys.push(key)
        
        
            const command = new PutObjectCommand({
                Bucket: config.s3.bucket,
                Key: key,
                ContentType: type
            })

            return command
        })


        const upload_urls = await Promise.all(commands.map((command) => getSignedUrl(s3Client, command, {expiresIn:3600})))
        res.status(200).json({"upload_urls": upload_urls, "keys": keys})
        return

    }catch(e){
        console.log(e)
        res.status(500).json({"error_message": "internal server error"})
        return
    }
})




export default router