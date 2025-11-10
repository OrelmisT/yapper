import { useContext } from "react";
import ConversationsContext from "../contexts/ConversationsContext";

const useConversations = () =>{
    return useContext(ConversationsContext)
}

export default useConversations