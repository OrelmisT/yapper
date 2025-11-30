import type { Conversation } from "../../../types"
import useConversations from "../../../hooks/useConversations"
import {Avatar} from '@mui/material'
import '../../../styles/ConversationCard.scss'
import useAuth from "../../../hooks/useAuth"
import useView from "../../../hooks/useView"
import { useEffect, useState } from "react"

const ConversationCard = ({conversation}: {conversation:Conversation}) => {

    const {setSelectedConversation, selectedConversation, lastReadTimestamps} = useConversations()
    const {view, setView} = useView()
    const {user} = useAuth()
    const [newMessageIndicator, setNewMessageIndicator] = useState(true)



    const handleClick = () => {
        if(selectedConversation && selectedConversation.id === conversation.id && view === 1){
            setSelectedConversation(undefined)
        }else{
            setSelectedConversation(conversation)
            setView(1)
        }
    }


    useEffect( () => {

        const lastReadTimestamp = lastReadTimestamps[conversation.id]
        // if(!lastReadTimestamp){
        //     setNewMessageIndicator(false)
        //     return
        // }
    
        const last_modified = conversation.last_modified
        if(last_modified === lastReadTimestamp){
            setNewMessageIndicator(false)
        }else{
            setNewMessageIndicator(true)
        }
      
    },[conversation,lastReadTimestamps])



    return (<div className="convoCard" data-selected={selectedConversation && selectedConversation.id === conversation.id} onClick={handleClick}>

    { conversation.members.length > 2 ?
        <>
            <Avatar>O</Avatar>
            <p className="convoName">MANY MEN</p>
        </>

        :
        <>

            {conversation.members.find(member=>member.id!==user?.id)?.pfp_url ? 
                <Avatar src={conversation.members.find(member=>member.id!==user?.id)?.pfp_url}></Avatar>
            
            :
                <Avatar>{conversation.members.find(member=>member.id!==user?.id)?.username[0].toUpperCase()}</Avatar>
            }
            <p className="convoName">{conversation.name ? conversation.name : conversation.members.find(member=>member.id!==user?.id)?.username}</p>
        </>


    }

    { newMessageIndicator && <div className=" new-message-indicator"></div>}



    </div>)
}

export default ConversationCard