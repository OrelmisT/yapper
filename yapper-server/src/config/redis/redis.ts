import config from '../config.js'
import Redis from 'redis'
import {RedisStore} from 'connect-redis'

//@ts-ignore
const client = Redis.createClient({url:config.redis_uri})

await client.connect()

export const redisStore =  new RedisStore({client})

export default client