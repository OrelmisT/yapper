import useConversations from "../../../hooks/useConversations"
import '../../../styles/ConversationPanel.scss'
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from '../../../config/axios.config'
import { useState } from "react"
import Message from "./Message"
import type { Socket } from "socket.io-client"




const ConversationPanel = ({socket}:{socket:Socket}) => {

    const queryClient = useQueryClient() 
    const {selectedConversation} = useConversations()
    const [messageInput, setMessageInput] = useState('')



    const getMessages = async () => {
        const  response =  await axios.get(`/conversations/${selectedConversation?.id}/messages`)
        return response.data.messages
    }

    const messagesQuery = useQuery({
        queryKey: ['conversations', selectedConversation?.id, 'messages'],
        queryFn: getMessages,
        enabled: selectedConversation !== undefined,
        placeholderData: []

    })


    


    const createNewPost = async () => {
        const response = await axios.post(`/conversations/${selectedConversation?.id}/messages`, {content: messageInput,type:'text'})
        const newMessage = response.data.message
        socket.emit("message", newMessage)
        return newMessage
    }

    const createNewMessageMutation = useMutation({
        mutationFn: createNewPost,
        retry:3,
        onSuccess: (newMessage) => {
            queryClient.setQueryData(['conversations', selectedConversation?.id, 'messages'], (old:[]) => [...old, newMessage])
            setMessageInput('')
        }

    })


    const handleSend = (e) => {
        e.preventDefault()
        if(messageInput === ''){
            return
        }

        createNewMessageMutation.mutate()

        console.log(messagesQuery.data)
    }


    return (<div id="conversationPanel">

        {
            selectedConversation  ?
                <>
                    <h1>{selectedConversation.members[0].username}</h1> 
                    <div id="text-window">
                        {messagesQuery.isLoading ? <h1>LOADING...</h1>:
                            <>
                                {messagesQuery.data.map((message) => <Message message={message}></Message>)}
                            </>
                        
                        }
                        
                    </div>

                    <form style={{all:'unset'}} onSubmit={(e) => handleSend(e)} >
                        <div className="input-container">
                            <input placeholder="New Message" value={messageInput} onChange={(e) => setMessageInput(e.target.value)}></input>
                            <button type="submit">Send</button>
                        </div>
                    </form>
                </>
            
            
            
            
            :<h1>Empty</h1>
        }


    </div>)

}


export default ConversationPanel