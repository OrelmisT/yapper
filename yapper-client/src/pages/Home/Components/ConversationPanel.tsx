import useConversations from "../../../hooks/useConversations"
import '../../../styles/ConversationPanel.scss'
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from '../../../config/axios.config'
import { useState, useRef, useEffect} from "react"
import Message from "./Message"
import type { Socket } from "socket.io-client"
import { FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import { faArrowDown } from "@fortawesome/free-solid-svg-icons"
import { parseTimestamp } from "../../../utils"
import useAuth from "../../../hooks/useAuth"
import { IoMdSettings } from "react-icons/io";



const ConversationPanel = ({socket}:{socket:Socket}) => {

    const queryClient = useQueryClient() 
    const {selectedConversation, conversations, setConversations, lastReadTimestamps, setLastReadTimestamps} = useConversations()
    const [messageInput, setMessageInput] = useState('')
    const textWindowRef = useRef(null)
    const [isPinnedToBottom, setIsPinnedToBottom] = useState(true)
    const [scrollButtonVisible, setScrollButtonVisible] = useState(false)
    const textAreaRef = useRef<HTMLTextAreaElement>(null)
    const {user} = useAuth()


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

    useEffect(()=> {
        setScrollButtonVisible(false)
        setIsPinnedToBottom(true)


    }, [selectedConversation])


    const handleScroll = (e) => {

        //keeps track of whether or not the user is at the bottom (in which case, we want automatic scroll when new message comes in)

        const marginOfError=5

        if(e.target.scrollTop + e.target.clientHeight >= e.target.scrollHeight - marginOfError){
            setIsPinnedToBottom(true)
            setScrollButtonVisible(false)
        }
        else{
            setIsPinnedToBottom(false)
            setScrollButtonVisible(true)
            
        }
    }

    const createNewPost = async () => {
        const response = await axios.post(`/conversations/${selectedConversation?.id}/messages`, {content: messageInput.trim(),type:'text'})
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

            // update lastupdated
            const prevConversation = conversations.find((c)=> c.id === newMessage.conversation_id)
            if(prevConversation){
                const modifiedConversation = {...prevConversation, last_modified: newMessage.timestamp}
                setConversations([...conversations.filter(c => c.id !== newMessage.conversation_id), modifiedConversation])
                setLastReadTimestamps({...lastReadTimestamps, [modifiedConversation.id]: newMessage.timestamp})
            }


        }

    })


    const handleSend = (e) => {
        e.preventDefault()
        if(messageInput.trim() === ''){
            return
        }

        createNewMessageMutation.mutate()

    }

    const handleEnterPress = (e:React.KeyboardEvent<HTMLTextAreaElement>) => {
        if(e.key === 'Enter' && !e.shiftKey){
            e.preventDefault()
            handleSend(e)
        }

    }



    useEffect(()=>{
        if(!textWindowRef.current){
            return
        }
        if(isPinnedToBottom){
            //scroll to bottom instantly
            textWindowRef.current.scrollTop = textWindowRef.current.scrollHeight

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


    useEffect(()=> {

        // alert("hello")


        const updateLastRead = async () =>{

            
            if(!isPinnedToBottom || !selectedConversation){
                return
            }
            
    
            const conversation = conversations.find(c => c.id === selectedConversation.id)
            if(!conversation){
                return
            }


            const lastReadNeedsUpdate = conversation?.last_modified !== lastReadTimestamps[conversation.id]
            if(!lastReadNeedsUpdate){
                return
            }

        
            const response = await axios.put(`/conversations/${conversation.id}/last_read`, {last_read_timestamp: conversation.last_modified})
            if(response.status === 200){
            
                setLastReadTimestamps({...lastReadTimestamps, [conversation.id]: conversation.last_modified})
            }

        }

        updateLastRead()
            
    }, [isPinnedToBottom, selectedConversation, conversations, lastReadTimestamps, setLastReadTimestamps])


    const mapMessages = (message, index) => {




        const timestamp = parseTimestamp(message.timestamp)
        const now = new Date()

        // Basically, determines if day is from a previous week (including current weekday but last week, even if less than 7 days before)
        const diffMilliseconds = now.getTime() - timestamp.timeInMilliseconds
        const differenceInDays = diffMilliseconds / ( 1000 * 60 * 60 * 24)
        const earlierWeek = (differenceInDays > 1 && timestamp.weekDayIndex === now.getDay()) || differenceInDays >= 7
        const isToday = differenceInDays < 1 && now.getDay() === timestamp.weekDayIndex



        const isGroupChat = selectedConversation ? selectedConversation.members.length > 2 : false

        



        if(index === 0){
            // This is the first message to be displayed so it should have a timestamp
            // If it is within the same week, should just use the day
            //

            if(earlierWeek){
                return(<>
                
                <p className="message-ts">{`${timestamp.weekDay}, ${timestamp.month} ${timestamp.day}, ${timestamp.year} at ${timestamp.time}`}</p>
                <Message message={message} displayUser={isGroupChat}></Message>
                </>)
            }

            else if(!isToday){

                return(<>
                
                <p className="message-ts">{`${timestamp.weekDay} at ${timestamp.time}`}</p>
                <Message message={message} displayUser={isGroupChat}></Message>
                </>)


            }

            return(
            <>
                
                <p className="message-ts">{`Today at ${timestamp.time}`}</p>
                <Message message={message} displayUser={isGroupChat}></Message>
            </>
        )
        }


        else{
            // what the timespamp looks like depends on how long it has been since the previous timestamp
            const prevTimestamp = parseTimestamp(messagesQuery.data[index-1].timestamp)
            const diffWithPrevMilliseconds =  timestamp.timeInMilliseconds - prevTimestamp.timeInMilliseconds
            
            const withinTheHour = ((diffWithPrevMilliseconds) / 3600000) < 1
            // const withinTheSameDay = (timestamp.weekDayIndex === prevTimestamp.weekDayIndex )  &&  (diffWithPrevMilliseconds/( 1000 * 60 * 60 * 24) < 1)

            const isDifferentUser = message.sender_id !== messagesQuery.data[index-1].sender_id

            if(withinTheHour){
                return(<Message message={message} displayUser={isDifferentUser && isGroupChat}></Message>) //No new timestamp
            }


            // new timestamp

            else if(earlierWeek){
                return(<>
                <p className="message-ts">{`${timestamp.weekDay}, ${timestamp.month} ${timestamp.day}, ${timestamp.year} at ${timestamp.time}`}</p>
                <Message message={message} displayUser={isGroupChat}></Message>
                </>)

            }


            else if(isToday){
                        return(
                    <>
                        
                        <p className="message-ts">{`Today at ${timestamp.time}`}</p>
                        <Message message={message} displayUser={isGroupChat}></Message>
                    </>
                )
            }


            return(
                <>
                
                <p className="message-ts">{`${timestamp.weekDay} at ${timestamp.time}`}</p>
                <Message message={message} displayUser={isGroupChat}></Message>
                </>

            )



        }

        // return(<Message message={message}></Message>)


    }

    return (<div id="conversationPanel">

        {
            selectedConversation  ?
                <>

                    <div id="convo-header">
                        {selectedConversation.name ? 
                        <h1>{selectedConversation.name}</h1> :
                        <h1>
                            {selectedConversation.members.filter(u => u.id !== user?.id).map((u) => u.username).join(', ')}
                        </h1>
                        }   

                        <div className="button-group">
                            <button style={{background:'none', width:'fit-content', height:'fit-content', border:'none', cursor:'pointer'}}>
                                <IoMdSettings size={30}></IoMdSettings>
                            </button>
                        </div>

                    </div>
                    <div id="text-window-container">

                        <div id="text-window" ref={textWindowRef} onScroll={(e) => handleScroll(e)}>
                            {messagesQuery.isLoading ? <h1>LOADING...</h1>:
                                <>
                                    <div id="message-panel-spacer"></div>
                                    {messagesQuery.data.map(mapMessages)}
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
                            <textarea placeholder="New Message" value={messageInput} onKeyDown={(e) => handleEnterPress(e)} onChange={(e) => setMessageInput(e.target.value)}></textarea>
                            {/* <input placeholder="New Message" value={messageInput} onChange={(e) => setMessageInput(e.target.value)}></input> */}
                            <button type="submit">Send</button>
                        </div>
                    </form>
                </>
            
            
            
            
            :<div id="empty-convo-panel">
                <img src="empty_messages.png"></img>
                <h1 style={{fontSize:'1rem'}}>Connect With Friends And Start Yapping Away!</h1>
            </div>
        }


    </div>)

}


export default ConversationPanel