import dotenv from 'dotenv'

dotenv.config();


const config ={
    port: process.env.PORT || 3000,
    client_url: process.env.CLIENT_URL,
    session_secret: process.env.SESSION_SECRET,
    db_uri: process.env.DB_URI,
    salt_rounds: process.env.SALT_ROUNDS,
    s3:{
        bucket: process.env.S3_BUCKET,
        access_key_id: process.env.S3_ACCESS_KEY_ID,
        secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
        endpoint: process.env.S3_ENDPOINT,
        pfp_url_prefix: process.env.S3_PFP_URL_PREFIX
    }
}

export default config;