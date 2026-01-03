import config from "../config.js";
import { Pool} from 'pg'

const db = new Pool({connectionString:config.db_uri})


export default db
