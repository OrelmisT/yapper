import { createContext } from "react";
import type { Conversation } from "../types";

const ConversationsContext = createContext<{
    conversations:Conversation[],
    setConversations: (conversations:Conversation[]) => void,
    selectedConversation: Conversation | undefined,
    setSelectedConversation: (conversation:Conversation|undefined) => void,
    lastReadTimestamps: {[key:string]:string},
    setLastReadTimestamps: (timestamps:{[key:string]:string}) => void
}
>({conversations: [], setConversations: ()=>{}, selectedConversation:undefined, setSelectedConversation: () =>{}, lastReadTimestamps:{}, setLastReadTimestamps: () => {}})



export default ConversationsContext