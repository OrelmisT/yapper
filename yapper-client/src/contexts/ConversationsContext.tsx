import { createContext } from "react";
import type { Conversation } from "../types";

const ConversationsContext = createContext<{
    conversations:Conversation[],
    setConversations: (conversations:Conversation[]) => void,
    selectedConversation: Conversation | undefined,
    setSelectedConversation: (conversation:Conversation|undefined) => void
}
>({conversations: [], setConversations: ()=>{}, selectedConversation:undefined, setSelectedConversation: () =>{}})



export default ConversationsContext