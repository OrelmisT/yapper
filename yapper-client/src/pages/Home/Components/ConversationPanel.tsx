import useConversations from "../../../hooks/useConversations"
import '../../../styles/ConversationPanel.scss'
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from '../../../config/axios.config'
import { useState, useRef, useEffect} from "react"
import Message from "./Message"
import type { Socket } from "socket.io-client"
import { FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import { faArrowDown } from "@fortawesome/free-solid-svg-icons"

const ConversationPanel = ({socket}:{socket:Socket}) => {

    const queryClient = useQueryClient() 
    const {selectedConversation} = useConversations()
    const [messageInput, setMessageInput] = useState('')
    const textWindowRef = useRef(null)
    const [isPinnedToBottom, setIsPinnedToBottom] = useState(true)
    const [scrollButtonVisible, setScrollButtonVisible] = useState(false)


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

    useEffect(()=>{

        // scrolls to the bottom on load of conversation
        if(!textWindowRef.current){
            return
        }
        textWindowRef.current.scrollTop = textWindowRef.current.scrollHeight
        setIsPinnedToBottom(true)
    },[selectedConversation, messagesQuery.isFetchedAfterMount])


    const handleScroll = (e) => {

        //keeps track of whether or not the user is at the bottom (in which case, we want automatic scroll when new message comes in)

        const marginOfError=5

        if(e.target.scrollTop + e.target.clientHeight >= e.target.scrollHeight - marginOfError){
            setIsPinnedToBottom(true)
            setScrollButtonVisible(false)
        }
        else{
            setIsPinnedToBottom(false)
            
        }
    }

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



    useEffect(()=>{
        if(!textWindowRef.current){
            return
        }
        if(isPinnedToBottom){
            //scroll to bottom instantly
            textWindowRef.current.scrollTop = textWindowRef.current.scrollHeight

        }else{
            //TODO: add button user can click to smoothly scroll to bottom
            if(!isPinnedToBottom){
                setScrollButtonVisible(true)
            }
        }
    },[messagesQuery.data])



    const handleSmoothScroll = (e:React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        const textWindow = textWindowRef.current
        if(!textWindow){
            return
        }
        textWindow.scrollTo({
            top: textWindow.scrollHeight,
            behavior:"smooth"
        })

    }

    return (<div id="conversationPanel">

        {
            selectedConversation  ?
                <>
                    <h1>{selectedConversation.members[0].username}</h1> 
                    <div id="text-window-container">

                        <div id="text-window" ref={textWindowRef} onScroll={(e) => handleScroll(e)}>
                            {messagesQuery.isLoading ? <h1>LOADING...</h1>:
                                <>
                                    <div id="message-panel-spacer"></div>
                                    {messagesQuery.data.map((message) => <Message message={message}></Message>)}
                                </>
                            
                        }
                            
                        </div>
                        <div className="scroll-btn-container">

                            <button className="scroll-btn" style={{display: scrollButtonVisible ? 'flex' : 'none'}} onClick={(e) => handleSmoothScroll(e)}>
                                <FontAwesomeIcon icon={faArrowDown} className="fa-lg" />
                            </button>
                        </div>
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