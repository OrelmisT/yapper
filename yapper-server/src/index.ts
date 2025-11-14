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




app.use(cors({
    origin:config.client_url,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

httpserver.listen(config.port, async () => {
    console.log("initializing tables")

    initialize_tables()

    console.log("tables initialized")
    console.log(`Server is running on http://localhost:${config.port}`);
})



io.on('connection', async (socket) => {
    const user = socket.request.session.user

    const result = await db.query('select conversation_id from conversation_members where member_id = $1', [user.id])
    const roomIds = result.rows


    await Promise.all(roomIds.map(roomIdEntry => socket.join(`room_${roomIdEntry.conversation_id}`)))


    socket.on("message", (new_message) =>{
        console.log(new_message)
        socket.in(`room_${new_message.conversation_id}`).emit('new_message', new_message)
    } )
    
    console.log(`All Rooms Joined`)
})


