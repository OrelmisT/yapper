export type User = {
    id: string;
    username: string;
    email:string;
    pfp_url?: string;
}


export type Conversation = {
    id: string,
    name: string,
    members: User[]
}

