import express from 'express';
import cors from 'cors';
import config from './config/config.js';
import api from './routes/api.js';
import session from 'express-session'
import initialize_tables from './config/db/init.js';

const app = express();

app.use(cors({
    origin:config.client_url,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session(
    {
        //@ts-ignore
        secret: config.session_secret,
        rolling: true,
        resave: false,
        saveUninitialized: false,
        cookie:{ maxAge:1000 * 60 * 60 * 24 * 7}
    }
))
app.use('/api',api)

app.listen(config.port, async () => {

    initialize_tables()

    console.log(`Server is running on http://localhost:${config.port}`);
})



