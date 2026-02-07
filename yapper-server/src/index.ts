import express from 'express';
import cors from 'cors';
import config from './config/config.js';
import api from './routes/api.js';
import session from 'express-session'
import initialize_tables from './config/db/init.js';
import s3Client from './config/s3/s3.config.js';
import { createServer } from 'http';
import {Server} from 'socket.io'
import { redisStore } from './config/redis/redis.js';
import db from './config/db/pg.js';

const app = express();
const httpserver = createServer(app)
const io = new Server(httpserver, {
    cors:{origin: config.client_url, credentials: true}
})



app.set('trust proxy', true)


app.use(cors({
    origin:config.client_url,
    credentials: true
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//ELB health check
app.get('/health',  (req, res) => {
    
    console.log(`health check ping`)
    return res.send('OK')
});

const sessionMiddleware = session(
    {
        //@ts-ignore
        secret: config.session_secret,
        rolling: true,
        resave: false,
        saveUninitialized: false,
        store: redisStore,
        cookie:{ maxAge:1000 * 60 * 60 * 24 * 7}
    }
)

app.use(sessionMiddleware)
io.engine.use(sessionMiddleware)

io.engine.use(sessionMiddleware)
app.use('/api',api)


httpserver.listen(config.port, "0.0.0.0" ,  async () => {
    console.log("initializing tables")

    initialize_tables().then(() => {
        console.log("tables initialized")
        console.log(`Server is running on http://localhost:${config.port}`);
    })

})




io.on('connection', async (socket) => {

    //@ts-ignore
    const user = socket.request.session.user
    if(!user){
        return
    }

    const result = await db.query('select conversation_id from conversation_members where member_id = $1', [user.id])
    const roomIds = result.rows


    await Promise.all(roomIds.map(roomIdEntry => socket.join(`room_${roomIdEntry.conversation_id}`)))
    await socket.join(`user_${user.id}`)


    socket.on("message", (new_message) =>{
        console.log(new_message)
        socket.in(`room_${new_message.conversation_id}`).emit('new_message', new_message)
    } )


    socket.on("notify_new_convo", ({conversation, user_ids}) => {
        socket.join(`room_${conversation.id}`)
        console.log(user_ids)

        for(let user_id of user_ids){
            console.log(`User ID:${user_id}`)

            socket.in(`user_${user_id}`).emit('new_convo', conversation)
        }

    })


    socket.on("join_room", (conversation_id) => {
        socket.join(`room_${conversation_id}`)
    })
    
    console.log(`All Rooms Joined`)
})


