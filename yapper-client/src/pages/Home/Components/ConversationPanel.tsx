import useConversations from "../../../hooks/useConversations"
import '../../../styles/ConversationPanel.scss'
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from '../../../config/axios.config'
import { useState, useRef, useEffect} from "react"
import MessageComponent from "./Message"
import type { Message} from '../../../types'
import { FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import { faArrowDown } from "@fortawesome/free-solid-svg-icons"
import { parseTimestamp } from "../../../utils"
import useAuth from "../../../hooks/useAuth"
import {IoMdSettings } from "react-icons/io";
import useSocket from "../../../hooks/useSocket"
import UserCard from "./UserCard"
import { BiSolidImageAdd } from "react-icons/bi";
import globalAxios from "axios"
import { IoIosArrowBack } from "react-icons/io";
import ImageSelectionPreview from "./ImageSelectionPreview"



type ConversationPanelProps ={
    sideBarVisible:boolean,
    setSideBarVisible: React.Dispatch<React.SetStateAction<boolean>>
}




const ConversationPanel = ({sideBarVisible, setSideBarVisible}: ConversationPanelProps) => {


    const socket = useSocket()
    const queryClient = useQueryClient() 
    const {selectedConversation, conversations, setConversations, lastReadTimestamps, setLastReadTimestamps, setSelectedConversation} = useConversations()
    const [messageInput, setMessageInput] = useState('')
    const textWindowRef = useRef<HTMLDivElement | null>(null)
    const uploadImageInputRef = useRef<HTMLInputElement | null>(null)
    const [isPinnedToBottom, setIsPinnedToBottom] = useState(true)
    const [scrollButtonVisible, setScrollButtonVisible] = useState(false)
    const {user} = useAuth()
    const [viewSettings, setViewSettings] = useState(false)
    const [conversationNameInput, setConversationNameInput] = useState('')
    const [imageFiles, setImageFiles] = useState<File[]>([])
    const [imageFileUrls, setImageFileUrls] = useState<string[]>([])


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
        setMessageInput('')
        setViewSettings(false)
        if(selectedConversation?.name){
            setConversationNameInput(selectedConversation.name)   
        }
        setConversationNameInput(selectedConversation?.name || '')


    }, [selectedConversation])

    useEffect(()=>{
        if(!textWindowRef.current){
            return
        }
        textWindowRef.current.scrollTop = textWindowRef.current.scrollHeight

    }, [viewSettings])


    const handleScroll = () => {

        //keeps track of whether or not the user is at the bottom (in which case, we want automatic scroll when new message comes in)

        const marginOfError=5

        if(!textWindowRef.current){
            return
        }

        const textWindow = textWindowRef.current


        
        if(textWindow.scrollTop + textWindow.clientHeight >= textWindow.scrollHeight - marginOfError){
            setIsPinnedToBottom(true)
            setScrollButtonVisible(false)
        }
        else{
            setIsPinnedToBottom(false)
            setScrollButtonVisible(true)
            
        }
    }

    const createNewMessages = async () => {

        //optimistic rendering
        const optimisticMessages:Message[] = []
        if(imageFileUrls.length > 0){
            for(const url of imageFileUrls){
                optimisticMessages.push({
                    id: `optimistic-${Math.random().toString(36)}`,
                    conversation_id: selectedConversation!.id,
                    sender_id:user!.id,
                    content:url,
                    type:'image',
                    timestamp: new Date().toISOString()
                })
            }
        }
        if(messageInput.trim() !== ''){
            optimisticMessages.push({
                id: `optimistic-${ Math.random().toString(36)}`,
                conversation_id: selectedConversation!.id,
                sender_id:user!.id,
                content:messageInput.trim(),
                type:'text',
                timestamp: new Date().toISOString()
            })
        }

        queryClient.setQueryData(['conversations', selectedConversation?.id, 'messages'], (old:[]) => [...old, ...optimisticMessages])
        setMessageInput('')



        const prevConversation = conversations.find((c)=> c.id === optimisticMessages[0].conversation_id)
            const latestMessage = optimisticMessages[optimisticMessages.length - 1]
            if(prevConversation){
                const modifiedConversation = {...prevConversation, last_modified: latestMessage.timestamp}
                setConversations([...conversations.filter(c => c.id !== latestMessage.conversation_id), modifiedConversation])
                setLastReadTimestamps({...lastReadTimestamps, [modifiedConversation.id]: latestMessage.timestamp})
            }

        setImageFiles([])
        setImageFileUrls([])


        


        // end of optimistic rendering


        const draftedMessages = []

        let imageKeys:string[] =[]

        if(imageFiles.length > 0){
            const contentTypes = imageFiles.map((file) => file.type)
            // console.log(contentTypes)
            const {upload_urls, keys} = (await axios.post('/conversations/message_image_upload_urls', {contentTypes})).data
            imageKeys = keys
            await Promise.all(upload_urls.map((url:string, index:number) => {
                return globalAxios.put(url, imageFiles[index], {
                    headers:{
                        'Content-Type': contentTypes[index]
                    }

                })
            })) 

        }

        for(const key of imageKeys){
            draftedMessages.push({content:`${key}`, type:'image'})
        }

        if(messageInput){
            draftedMessages.push({content: messageInput.trim(), type:'text'})
        }
        
        const response = await axios.post(`/conversations/${selectedConversation?.id}/messages`, {messages:draftedMessages})
        const newMessages = response.data.messages
        
     
        return newMessages
    }

    const createNewMessageMutation = useMutation({
        mutationFn: createNewMessages,
        retry:3,
        onSuccess: (newMessages) => {

            if(socket){

            for(const message of newMessages){
                socket.emit("message", message)
              
            }
        }
            console.log("Messages(s) sent successfully")

        }

    })


    const handleSend = (e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLTextAreaElement>) => {
        e.preventDefault()
        if(messageInput.trim() === '' && imageFiles.length === 0){
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





    const handleSmoothScroll = () => {
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


    const mapMessages = (message:Message, index:number) => {




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
                <MessageComponent message={message} displayUser={isGroupChat}></MessageComponent>
                </>)
            }

            else if(!isToday){

                return(<>
                
                <p className="message-ts">{`${timestamp.weekDay} at ${timestamp.time}`}</p>
                <MessageComponent message={message} displayUser={isGroupChat}></MessageComponent>
                </>)


            }

            return(
            <>
                
                <p className="message-ts">{`Today at ${timestamp.time}`}</p>
                <MessageComponent message={message} displayUser={isGroupChat}></MessageComponent>
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
                return(<MessageComponent message={message} displayUser={isDifferentUser && isGroupChat}></MessageComponent>) //No new timestamp
            }


            // new timestamp

            else if(earlierWeek){
                return(<>
                <p className="message-ts">{`${timestamp.weekDay}, ${timestamp.month} ${timestamp.day}, ${timestamp.year} at ${timestamp.time}`}</p>
                <MessageComponent message={message} displayUser={isGroupChat}></MessageComponent>
                </>)

            }


            else if(isToday){
                        return(
                    <>
                        
                        <p className="message-ts">{`Today at ${timestamp.time}`}</p>
                        <MessageComponent message={message} displayUser={isGroupChat}></MessageComponent>
                    </>
                )
            }


            return(
                <>
                
                <p className="message-ts">{`${timestamp.weekDay} at ${timestamp.time}`}</p>
                <MessageComponent message={message} displayUser={isGroupChat}></MessageComponent>
                </>

            )



        }

    }


    const updateConversationName = async () => {
        
        const response = await axios.put(`/conversations/${selectedConversation?.id}`, {name: conversationNameInput})
        if(response.status === 200){
            let updatedConversation = response.data.updated_conversation
            updatedConversation = {...updatedConversation, members: selectedConversation?.members || []}
            const newConversations = conversations.map(c => c.id === updatedConversation.id ? updatedConversation : c)
            setConversations(newConversations)
            setSelectedConversation(updatedConversation)
            // setConversations(conversations.map(c => c.id === updatedConversation.id ? updatedConversation : c ))
            // setSelectedConversation(updatedConversation)
            
        }
        
    }


    const handleImageUpload = (e:React.MouseEvent<HTMLButtonElement, MouseEvent>) =>{

        e.preventDefault()
        // alert("JE")

        if(!uploadImageInputRef.current){
            return
        }
        uploadImageInputRef.current.click()
    }

    const handleFileChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        if(!e.target.files){
            return
        }

        const filesArray = Array.from(e.target.files)
        setImageFiles(prev => [...prev, ...filesArray])
        const fileUrlsArray = filesArray.map(file => URL.createObjectURL(file))
        setImageFileUrls(prev => [...prev, ...fileUrlsArray])

        console.log(fileUrlsArray)
    }


    return (<div id="conversationPanel">

        {
            selectedConversation  ?

                <>

                    { viewSettings ? 
                    
                        <div style={{display:'flex', flexDirection:'column', height:'100%'}}>
                            <div id="convo-header">

                                <button className="toggle-sidebar-button" data-sidebar-visible={sideBarVisible}>
                                    <IoIosArrowBack className="settings-icon" onClick={() => setSideBarVisible((prev) => !prev)} size={30}></IoIosArrowBack>
                                </button>

                                <h1>Chat Settings</h1>

                                <div className="button-group">
                                    <button onClick={() => setViewSettings(false)} style={{background:'none', width:'fit-content', height:'fit-content', border:'none', cursor:'pointer'}}>
                                    <IoMdSettings className="settings-icon" size={30}></IoMdSettings>
                                    </button>
                                </div>
                            </div>

                            <div style={{padding:'1rem', borderBottom:'1px solid #D1D5DB'}}>

                                <h2>Chat Name</h2>
                                <div style={{position:'relative', marginTop:'1rem'}}>

                                    <input placeholder="Conversation Name" style={{paddingLeft:'1rem', paddingRight:'4.8rem'}} value={conversationNameInput} onChange={(e)=> setConversationNameInput(e.target.value)}></input>
                                    <button style={{position:'absolute', height:'100%', right:'0', borderTopLeftRadius:'0', borderBottomLeftRadius:'0'}} onClick={() => updateConversationName()} disabled={conversationNameInput === selectedConversation.name} className="primary-button">
                                        Save
                                    </button>
                                </div>

                        
                            </div>
                    

                            <div id="member-list-container" style={{padding:'1rem', flexGrow:'2', overflowY:'scroll'}}>
                                <h2>Members</h2>
                                <div className="member-list">
                                    {selectedConversation.members.map((user) => <UserCard user={user}></UserCard>)}
                                </div>
                            </div>

                            <div style={{justifySelf:'flex-end', display:'flex', flexDirection:'column', padding:"1rem",gap:'1rem', borderTop:'1px solid #D1D5DB'}}>
                                <button className="primary-button">Add Member</button>
                                <button className="secondary-button">Leave Conversation</button>
                            </div>
                        </div>
                    
                    :

                        
                        <>
                    <div id="convo-header">

                        <button className="toggle-sidebar-button" data-sidebar-visible={sideBarVisible}>
                            <IoIosArrowBack onClick={() => setSideBarVisible((prev) => !prev)} size={30}></IoIosArrowBack>
                        </button>

                        {selectedConversation.name ? 
                        <h1>{selectedConversation.name}</h1> :
                        <h1>
                            {selectedConversation.members.filter(u => u.id !== user?.id).map((u) => u.username).join(', ')}
                        </h1>
                        }   

                        <div className="button-group">
                            <button onClick={() => setViewSettings(true)} style={{background:'none', width:'fit-content', height:'fit-content', border:'none', cursor:'pointer'}}>
                                <IoMdSettings size={30}></IoMdSettings>
                            </button>
                        </div>

                    </div>
                    <div id="text-window-container">

        

                        <div id="text-window" ref={textWindowRef} onScroll={() => handleScroll()}>

                            <div id="top-spacer" style={{height:'1rem'}}></div>
                            {messagesQuery.isLoading ? <h1>LOADING...</h1>:
                                <>
                                    <div id="message-panel-spacer"></div>
                                    {messagesQuery.data.map(mapMessages)}
                                </>
                            
                        }

                        <div id="bottom-spacer" style={{height:'1rem'}}></div>
                            
                        </div>
                        <div className="scroll-btn-container">

                            <button className="scroll-btn" style={{display: scrollButtonVisible ? 'flex' : 'none'}} onClick={() => handleSmoothScroll()}>
                                <FontAwesomeIcon icon={faArrowDown} className="fa-lg" />
                            </button>
                        </div>
                    </div>

                    <form style={{all:'unset'}} onSubmit={(e) => handleSend(e)} >

                        { imageFileUrls.length > 0 &&

                            <div className="image-selection-container">
                            {imageFileUrls.map((url, index) => <ImageSelectionPreview key={index} imageUrl={url} setImageFileUrls={setImageFileUrls} setImageFiles={setImageFiles} imageUrls={imageFileUrls}></ImageSelectionPreview>)}
                        </div>
                        }
                        <div className="input-container">
                            <button id="add-button"  onClick={(e) => handleImageUpload(e)}>
                                <BiSolidImageAdd className="add-icon"></BiSolidImageAdd>
                            </button>
                            <input ref={uploadImageInputRef} accept="image/*" multiple onChange={(e) => handleFileChange(e)} type="file" style={{display:'none'}}></input>
                            <textarea placeholder="New Message" value={messageInput} onKeyDown={(e) => handleEnterPress(e)} onChange={(e) => setMessageInput(e.target.value)}></textarea>
                            {/* <input placeholder="New Message" value={messageInput} onChange={(e) => setMessageInput(e.target.value)}></input> */}
                            <button type="submit">Send</button>
                        </div>
                    </form>
                    </>
                }
                </>
            
            
            
            
            :<div id="empty-convo-panel">
                <button style={{position:'absolute', top:"1rem", left:"1rem"}} className="toggle-sidebar-button" data-sidebar-visible={sideBarVisible}>            
                    <IoIosArrowBack onClick={() => setSideBarVisible((prev) => !prev)} size={30}></IoIosArrowBack>
                                    
                </button>
                <img src="empty_messages.png"></img>
            </div>
        }


    </div>)

}


export default ConversationPanel
