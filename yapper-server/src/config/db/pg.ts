import config from "../config.js";
import {Client} from 'pg'

const db = new Client({connectionString:config.db_uri})
db.connect()


export default db