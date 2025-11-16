import type { Conversation } from "../../../types"
import useConversations from "../../../hooks/useConversations"
import {Avatar} from '@mui/material'
import '../../../styles/ConversationCard.scss'
import useAuth from "../../../hooks/useAuth"
import useView from "../../../hooks/useView"

const ConversationCard = ({conversation}: {conversation:Conversation}) => {

    const {setSelectedConversation, selectedConversation} = useConversations()
    const {view, setView} = useView()
    const {user} = useAuth()


    const handleClick = () => {
        if(selectedConversation && selectedConversation.id === conversation.id && view === 1){
            setSelectedConversation(undefined)
        }else{
            setSelectedConversation(conversation)
            setView(1)
        }
    }

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



    </div>)
}

export default ConversationCard