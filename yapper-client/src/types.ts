export type User = {
    id: string;
    username: string;
    email:string;
    pfp_url?: string;
}


export type Conversation = {
    id: string,
    name: string,
    members: User[],
    last_modified: string
}



export type Message = {
    id: string,
    conversation_id: string,
    sender_id: string,
    content:string,
    type: string,
    timestamp:string
}