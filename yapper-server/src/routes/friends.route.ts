import { Router } from "express";
import requireSession from "../middleware/session.middleware.js";
import db from "../config/db/pg.js";

const router = Router()



router.get('/', requireSession, async (req, res) => {

    try{
        const user_id = req.session.user?.id
        const response = await db.query('select accounts.id as id, accounts.username as username, accounts.email as email, accounts.pfp_url as pfp_url  from friendships join accounts on friendships.user_id_2 = accounts.id where friendships.user_id_1 = $1', [user_id])

        res.status(200).json({"friends":response.rows})
        return



    }catch(e){
        console.log(e)
        res.status(500).json({"error_message":"internal server error"})
        return
    }

})


router.post('/', requireSession, async (req, res) => {
    
    try{
        const {user_1_id, user_2_id} = req.body
        const user_id = req.session.user?.id

        if((user_id !== user_1_id) && (user_id !== user_2_id)){
            res.status(403).json({"error_message":"The user is not authorized to perform this action."})
            return
        }


        await db.query('insert into friendships(user_1_id, user_2_id) values ($1, $2)', [user_1_id, user_2_id])
        await db.query('insert into friendships(user_2_id, user_1_id) values ($1, $2)', [user_2_id, user_1_id])

        res.status(201).json({"message":"friendship successfully created"})
        return

    }catch(e){
        console.log(e)
        res.status(500).json({"error_message":"internal server error"})
        return
    } 

})



router.get('/friend_requests', requireSession, async (req, res) => {

    try{
        const user_id = req.session.user?.id
        

        // sent requests
        const sent_requests_res = await db.query('select accounts.id as id, accounts.username as username, accounts.pfp_url as pfp_url, accounts.email as email from friend_requests join accounts on friend_requests.receiver_id = accounts.id where sender_id = $1', [user_id])
        const sent_requests = sent_requests_res.rows

        //received requests
        const received_requests_res = await db.query('select accounts.id as id, accounts.username as username, accounts.pfp_url as pfp_url, accounts.email as email from friend_requests join accounts on friend_requests.sender_id = accounts.id where receiver_id = $1', [user_id])
        const received_requests = received_requests_res.rows

        res.status(200).json({sent_requests, received_requests})
        return       

    }catch(e){

        console.log(e)
        res.status(500).json({"error_message": "internal server error"})
        return
    }   
})


router.post('/friend_requests', requireSession, async (req, res)=>{
    try{
        const {sender_id, receiver_id} = req.body
        const user_id = req.session.user?.id

        if(sender_id !== user_id){
            res.status(403).json({"error_message":"The user is not authorized to perform this action."})
            return
        }

        //check if this friend request has already been made
        const exsits_res = await db.query('select * from friend_requests where sender_id = $1 and receiver_id = $2', [sender_id, receiver_id])
        //@ts-ignore
        if(exsits_res.rowCount > 0){
            res.status(409).json({"error_message":"This friend request already exists"})
            return 
        }

        const reverse_exists_res = await db.query('select * from friend_requests where sender_id = $1 and receiver_id = $2', [receiver_id, sender_id])
        //@ts-ignore
        if(exsits_res.rowCount > 0){
            res.status(409).json({"error_message": "A friend request already exists in the opposite direction"})
            return
        }


        const receiver_res = await db.query('select * from accounts where id = $1', [receiver_id])
        if (receiver_res.rowCount == 0){
            res.status(404).json({"error_message": "receiving user not found"})
            return 
        }

        const receiving_user = receiver_res.rows[0]


        //TODO: Create the friend request
        await db.query('insert into friend_requests(sender_id, receiver_id) values($1, $2)', [sender_id, receiver_id])

        res.status(201).json({sentRequest: receiving_user})
        return





    }catch(e){
        console.log(e)
        res.status(500).json({"error_message":"internal server error"})
    }

})



router.delete('/friend_requests', requireSession, async (req, res) => {

    try{
        const {sender_id, receiver_id} = req.query
        const user_id = req.session.user?.id

        if((user_id !== sender_id) && (user_id !== receiver_id)){
            res.status(403).json({"error_message":"The user is not authorized to perform this action."})
            return 
        }

        await db.query('delete from friend_requests where sender_id = $1 and receiver_id = $2', [sender_id, receiver_id])

        res.status(200).json({"messsage":"friend request successfully deleted or was not found"})
        return



    }catch(e){
        console.log(e)
        res.status(500).json({"error_message":"internal server error"})
        return
    }

})



router.post('/friendships', requireSession, async (req, res) => {
    try{
        const {sender_id, receiver_id} = req.body
        const user_id = req.session.user?.id


        // friendship can only be created by user accepting a friend request
        if(user_id !== receiver_id){
            res.status(403).json({"error_message":"The user is not authorized to perform this action."})
            return
        }


        const friend_req_exists_res = await db.query('select * from friend_requests where sender_id = $1 and receiver_id = $2', [sender_id, receiver_id])
        if(friend_req_exists_res.rowCount == 0){
            res.status(404).json({"error_message":"No such friend request exists for the user to accept"})
            return 
        }

        const friend_request_id = friend_req_exists_res.rows[0].id
        await db.query('delete from friend_requests where id = $1', [friend_request_id])
        await db.query('insert into friendships(user_id_1, user_id_2) values ($1, $2)', [sender_id, receiver_id])
        await db.query('insert into friendships(user_id_1, user_id_2) values ($1, $2)', [receiver_id, sender_id])

        res.status(201).json({"message":"friendship successfully created"})
        return 
        
    }catch(e){
        console.log(e)
        res.status(500).json({"error_message":"internal server error"})
        return
    }

})


router.delete('/friendships', requireSession, async (req, res) => {
    try{
        const {user_id_1, user_id_2} = req.query
        const user_id = req.session.user?.id
        if((user_id !== user_id_1) && (user_id !== user_id_2)){
            res.status(403).json({"error_message":"The user is not authorized to perform this action."})
            return 
        }

        await db.query('delete from friendships where user_id_1 = $1 and user_id_2 = $2', [user_id_1, user_id_2])
        await db.query('delete from friendships where user_id_1 = $1 and user_id_2 = $2', [user_id_2, user_id_1])    
        
        res.status(200).json({"message":"friendship successfully deleted or was not found"})
        return

    }catch(e){
        console.log(e)
        res.status(500).json({"error_message":"internal server error"})
        return
    }
})





router.get('/users', async (req, res) => {


    try{

        const query = req.query.username_query
        const response = await db.query('select *  from accounts WHERE username % $1 order by similarity(username, $1) desc limit 10', [query])

        res.status(200).json({"users": response.rows})

    }catch(e){
        res.status(500).json({"error_message":"internal server error"})
    }

})





export default router