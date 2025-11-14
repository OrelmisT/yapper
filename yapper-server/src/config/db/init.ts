import db from "./pg.js";

const initialize_tables = async () => {
    // setup tables if they don't already exist
    
    try{
    await db.query(`
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        CREATE EXTENSION IF NOT EXISTS pg_trgm;


        CREATE TABLE IF NOT EXISTS accounts (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            username VARCHAR(50) NOT NULL UNIQUE,
            email VARCHAR(100) NOT NULL UNIQUE,
            password TEXT NOT NULL,
            pfp_url TEXT
            );

        CREATE INDEX IF NOT EXISTS idx_users_username_trgm ON accounts USING gin (username gin_trgm_ops);


        CREATE TABLE IF NOT EXISTS friend_requests(
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        sender_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
        receiver_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
        CONSTRAINT unique_request UNIQUE(sender_id, receiver_id),
        CONSTRAINT no_self_requst CHECK(sender_id <> receiver_id)
        );

        CREATE TABLE IF NOT EXISTS friendships(
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id_1 UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
        user_id_2 UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
        CONSTRAINT unique_friendship UNIQUE(user_id_1, user_id_2),
        CONSTRAINT no_self_friendship CHECK(user_id_1 <> user_id_2)
        
        );

        CREATE TABLE IF NOT EXISTS conversations(
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(100),
        is_group BOOLEAN NOT NULL DEFAULT FALSE);

        CREATE TABLE IF NOT EXISTS conversation_members(
        conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        member_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
        CONSTRAINT unique_member_in_conversation UNIQUE(conversation_id, member_id),
        PRIMARY KEY (conversation_id, member_id));

        CREATE TABLE IF NOT EXISTS messages(
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        sender_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'image', 'video')),
        timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP);
        CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
        `);

    }catch(e){
        console.log('Something went wrong while trying to initialize the tables')
        console.log(e)
    }

}

export default initialize_tables