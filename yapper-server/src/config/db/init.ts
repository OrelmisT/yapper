import db from "./pg.js";

const initialize_tables = async () => {
    // setup tables if they don't already exist
    
    try{
    await db.query(`
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        CREATE TABLE IF NOT EXISTS accounts (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            username VARCHAR(50) NOT NULL UNIQUE,
            email VARCHAR(100) NOT NULL UNIQUE,
            password TEXT NOT NULL,
            pfp_url TEXT
            );
        `);
    }catch(e){
        console.log('Something went wrong while trying to initialize the tables')
        console.log(e)
    }

}

export default initialize_tables