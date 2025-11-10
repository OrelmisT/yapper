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
import io from 'socket.io-client'
import config from "../../config/config"
import useConversations from "../../hooks/useConversations"
import ConversationCard from "./Components/ConversationCard"
import useView from "../../hooks/useView"
import ConversationPanel from "./Components/ConversationPanel"

const Home = () => {



    const {setFriends, setSentFriendRequests, setReceivedFriendRequests} = useFriends()
    const {conversations, setConversations} = useConversations()




    useEffect(() => {

        const socket = io(config.socketURL, {withCredentials:true})
        socket.on("connect", () => {
            
            console.log("connected")
        })
        


        return () => {socket.disconnect()}

    }, [])

    const {view, setView} = useView()

    // const [view, setView] = useState(1) // 1: conversations, 2: start conversations with friends, 3: 

    const nav = useNavigate()
    const {user} = useAuth()

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



    return(
        <div className="home_page_layout">
            <div id="side-bar">
                <div id="convo-search-bar">
                    <FontAwesomeIcon id="search_icon" icon={faSearch} />
                    <input type="text" placeholder="Search Conversations">

                    
                    </input>
                </div>
                <div id="conversations">
                    {conversations.map(convo => <ConversationCard conversation={convo}></ConversationCard>)}
                

                </div>
                <nav id="side-bar-nav">
                    <button id="conversations_button" className="isSelected" onClick={() => setView(1)}></button>
                    <button id="new_conversation_button" onClick={() => setView(2)}></button>
                    <button id="add_friends_button" onClick={() => setView(3)}></button>

                </nav>
            </div>
            <div id="view">
                {view === 1 &&

                    <ConversationPanel/>
                
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