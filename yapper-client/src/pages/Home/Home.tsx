import useAuth from "../../hooks/useAuth"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import '../../styles/Home.css'
import {faSearch} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import axios from '../../config/axios.config'
import useFriends from "../../hooks/useFriends"
import ManageFriendsPanel from "./Components/ManageFriendsPanel"
import ManageConversationsPanel from "./Components/ManageConversationsPanel"
import io, { Socket } from 'socket.io-client'
import config from "../../config/config"
import useConversations from "../../hooks/useConversations"
import ConversationCard from "./Components/ConversationCard"
import useView from "../../hooks/useView"
import ConversationPanel from "./Components/ConversationPanel"
import { useQueryClient } from "@tanstack/react-query"
import useSocket from "../../hooks/useSocket"
import type { Conversation } from "../../types"

const Home = () => {

    const queryClient = useQueryClient() 


    const {setFriends, setSentFriendRequests, setReceivedFriendRequests} = useFriends()
    const {conversations, setConversations} = useConversations()
    // const [socket, setSocket] = useState<Socket>()
    const {user} = useAuth()
    const socket = useSocket()




    useEffect(() => {
        if(!socket){
            return
        }


        socket.on('new_message', (newMessage) => {

            
            queryClient.setQueryData(['conversations', newMessage.conversation_id, "messages"], (prev:[]) =>{

                if(!prev){
                    return [newMessage]
                }
                else{
                    return [...prev, newMessage]
                }

            })

            
            const conversation = conversations.find((c) => c.id === newMessage.conversation_id)
            const newConversations = conversations.filter((c) => c.id !== newMessage.conversation_id)
            if (conversation){
                // alert("chewbaca")
                const modifiedConversation = {...conversation, last_modified:newMessage.timestamp}
                // conversation.last_modified = newMessage.timestamp
                setConversations([...newConversations, modifiedConversation])
            }
            

        })


        socket.on('new_convo', (newConversation:Conversation) => {
            
            setConversations([...conversations, newConversation])
            socket.emit('join_room', newConversation.id)
            
        })


    }, [socket, queryClient, setConversations, conversations])

    
    const {view, setView} = useView()

    // const [view, setView] = useState(1) // 1: conversations, 2: start conversations with friends, 3: 

    const nav = useNavigate()

    useEffect(()=>{
        if(!user){
            nav('/login')        
        }
    }, [user, nav])


    useEffect(  ()=> {


        const get_friend_data = async () => {

            try{
                
                // look up friend requests
                const response =  await axios.get('/friends/friend_requests')
                console.log(`sent requests: ${response.data.sent_requests}`)
                setSentFriendRequests(response.data.sent_requests)
                console.log(`received requests: ${response.data.received_requests}`)
                setReceivedFriendRequests(response.data.received_requests)
                
            }catch(e){
                console.log(e)
            }
            
            
            
            try{
                // look up friends 
                const response = await axios.get('/friends')
                console.log(`friends: ${response.data.friends}`)
                setFriends(response.data.friends)
                
            }catch(e){
                console.log(e)
                
            }
            
        }

        const getConversationData = async () => {
            try{

                const response = await axios.get('/conversations')
                console.log(`convo data: ${response.data}`)
                setConversations(response.data.conversations)
            }catch(e){
                console.log(e)
            }

        }
    

        get_friend_data()
        getConversationData()


    }, [user, setFriends, setSentFriendRequests, setReceivedFriendRequests, setConversations])


    const sortConversations = ((a, b) => {
        const date1 = new Date(a.last_modified)
        const date2 = new Date(b.last_modified)
        return  (date1.getTime()  - date2.getTime()) * -1
        

    })



    return(
        <div className="home_page_layout">
            <div id="side-bar">
                <div id="convo-search-bar">
                    <FontAwesomeIcon id="search_icon" icon={faSearch} />
                    <input type="text" placeholder="Search Conversations">

                    
                    </input>
                </div>
                <div id="conversations">
                    {[...conversations].sort(sortConversations).map(convo => <ConversationCard conversation={convo}></ConversationCard>)}
                

                </div>
                <nav id="side-bar-nav">
                    <button id="conversations_button" className="isSelected" onClick={() => setView(1)}></button>
                    <button id="new_conversation_button" onClick={() => setView(2)}></button>
                    <button id="add_friends_button" onClick={() => setView(3)}></button>

                </nav>
            </div>
            <div id="view">
                {view === 1 &&

                    <ConversationPanel socket={socket}/>
                
                }


                {view === 2 &&
                    <ManageConversationsPanel/>
                }


                {view === 3 &&

                    <ManageFriendsPanel/>
                    
                }
            </div>



        </div>
    )
}


export default Home