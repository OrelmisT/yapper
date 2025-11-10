import {S3Client} from '@aws-sdk/client-s3'
import config from '../config.js'

//@ts-ignore
const s3Client = new S3Client({
    region:'auto',
    endpoint: config.s3.endpoint,
    credentials:{
        accessKeyId: config.s3.access_key_id,
        secretAccessKey: config.s3.secret_access_key
    }
})

export default s3Client;