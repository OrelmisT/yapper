import ConversationsContext from "../contexts/ConversationsContext";
import { useState } from "react";
import type { Conversation } from "../types";
// import React from "react";


const ConversationsProvider = ({children}:{children:React.ReactNode}) => {

    const [conversations, setConversations] = useState<Conversation[]>([])
    const [selectedConversation, setSelectedConversation] = useState<Conversation|undefined>(undefined)

    return (
        <ConversationsContext.Provider value={{conversations, setConversations, selectedConversation, setSelectedConversation}}>
            {children}
        </ConversationsContext.Provider>
    )




}


export default ConversationsProvider