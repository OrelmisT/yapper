import dotenv from 'dotenv'

dotenv.config();


const config ={
    port: process.env.PORT || 3000,
    client_url: process.env.CLIENT_URL,
    session_secret: process.env.SESSION_SECRET,
    db_uri: process.env.DB_URI,
    salt_rounds: process.env.SALT_ROUNDS
}

export default config;