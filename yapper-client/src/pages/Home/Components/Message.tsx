import useAuth from "../../../hooks/useAuth"
import '../../../styles/Message.scss'
import useConversations from "../../../hooks/useConversations"
import { useEffect, useState } from "react"
import type { Message as MessageType, User } from "../../../types"
import { Avatar } from "@mui/material"

const Message = ({message, displayUser = false}: {message:MessageType, displayUser:boolean}) => {
    const {user} = useAuth()
    const {selectedConversation} = useConversations()
    const [sender, setSender] = useState<User>()

    useEffect(()=>{
        const messageSender = selectedConversation?.members.find((u) => u.id === message.sender_id)
        if(messageSender){
            setSender(messageSender)
        }

    },[selectedConversation, message.sender_id])



    return(
        <>
    
        {(sender && sender.id !== user?.id && displayUser) &&
        <div className="userDetails">
            {sender.pfp_url ?<Avatar sx={{ height: '30px', width: '30px' }} src={sender.pfp_url}></Avatar>:<Avatar sx={{ height: '30px', width: '30px' }}>{sender.username[0].toUpperCase()}</Avatar>}
            <p>{sender.username}</p>
        </div>
        }
        <div className="message" data-isUsersPost={message.sender_id === user?.id}>
            {message.content.trim()}

        </div>
        </>
    
    )



}

export default Message