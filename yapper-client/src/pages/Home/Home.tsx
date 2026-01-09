import useAuth from "../../hooks/useAuth"
import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router"
import '../../styles/Home.css'
import {faSearch } from '@fortawesome/free-solid-svg-icons'
import { BsPeople, BsPeopleFill, BsPlusCircle, BsPlusCircleFill} from "react-icons/bs";
import { BiMessageSquareDetail, BiSolidMessageSquareDetail  } from "react-icons/bi";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import axios from '../../config/axios.config'
import useFriends from "../../hooks/useFriends"
import ManageFriendsPanel from "./Components/ManageFriendsPanel"
import ManageConversationsPanel from "./Components/ManageConversationsPanel"
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
    const {conversations, setConversations, setLastReadTimestamps} = useConversations()
    // const [socket, setSocket] = useState<Socket>()
    const {user} = useAuth()
    const socket = useSocket()
    const [sideBarVisible, setSideBarVisisible] = useState(false)
    const sideBarRef = useRef<HTMLDivElement>(null)





    useEffect(() => {
        if(!socket){
            return
        }


        socket.on('new_message', (newMessage) => {

            // alert("ew")
            queryClient.setQueryData(['conversations', newMessage.conversation_id, "messages"], (prev:[]) =>{
                

                if(!prev){
                    return [newMessage]
                }
                else{

                    // return [...prev]
                    // console.log([...prev, newMessage])

                    return [...prev, newMessage]
                }

            })

            
            const conversation = conversations.find((c) => c.id === newMessage.conversation_id)
            const newConversations = conversations.filter((c) => c.id !== newMessage.conversation_id)
            if (conversation){
                // alert("chewbaca")
                const modifiedConversation = {...conversation, last_modified:newMessage.timestamp}
                console.log(`new ts:${newMessage.timestamp}`)
                // conversation.last_modified = newMessage.timestamp
                console.log("updating new ts")
                setConversations([...newConversations, modifiedConversation])
            }
            

        })


        socket.on('new_convo', (newConversation:Conversation) => {
            
            setConversations([...conversations, newConversation])
            socket.emit('join_room', newConversation.id)
            
        })
        

        return() => {socket.off('new_message')}


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
                setSentFriendRequests(response.data.sent_requests)
                setReceivedFriendRequests(response.data.received_requests)
                
            }catch(e){
                console.log(e)
            }
            
            
            
            try{
                // look up friends 
                const response = await axios.get('/friends')
                setFriends(response.data.friends)
                
            }catch(e){
                console.log(e)
                
            }
            
        }

        const getConversationData = async () => {
            try{

                const response = await axios.get('/conversations')
                const lastReadTimestamps = response.data.last_read_timestamps
                const lastReadTimestampsMap:{[key:string] : string} = {}
              
                for(const ts of lastReadTimestamps){
                    console.log(ts)

                    lastReadTimestampsMap[ts.conversation_id] = ts.last_read_timestamp 


                }
                setLastReadTimestamps(lastReadTimestampsMap)
                setConversations(response.data.conversations)
            }catch(e){
                console.log(e)
            }

        }
    

        get_friend_data()
        getConversationData()


    }, [user, setFriends, setSentFriendRequests, setReceivedFriendRequests, setConversations, setLastReadTimestamps])


    const sortConversations = ((a:Conversation, b:Conversation) => {
        const date1 = new Date(a.last_modified)
        const date2 = new Date(b.last_modified)
        return  (date1.getTime()  - date2.getTime()) * -1
        

    })

    const handleClick = (e:React.MouseEvent) => {
        if(sideBarRef.current && !sideBarRef.current.contains(e.target as Node) && sideBarVisible){
            setSideBarVisisible(false)
        }

    }

    const navView = (viewNumber:number) => {
        setView(viewNumber)
        setSideBarVisisible(false)
    }



    return(
        <div className="home_page_layout" onClick={(e) => handleClick(e)}>
            <div id="side-bar" ref={sideBarRef} data-closed={sideBarVisible ? "false": "true"}>
                <div id="convo-search-bar">
                    <FontAwesomeIcon id="search_icon" icon={faSearch} />
                    <input type="text" placeholder="Search Conversations">

                    
                    </input>
                </div>
                <div id="conversations">
                    {[...conversations].sort(sortConversations).map(convo => <ConversationCard conversation={convo} setSideBarVisible={setSideBarVisisible}></ConversationCard>)}
                

                </div>
                <nav id="side-bar-nav" >
                    <button className="isSelected" onClick={() => navView(1)}>{
                        view === 1 ?
                        <BiSolidMessageSquareDetail size={32} color= {'#c7000dff'}></BiSolidMessageSquareDetail>:
                        <BiMessageSquareDetail size={32} color= {'black'}></BiMessageSquareDetail>
                        
                        }</button>


                    <button  onClick={() => navView(2)} style={{overflow:"visible"}}>
                        {view === 2?
                        <BsPlusCircleFill size={30} color= {'#c7000dff'}></BsPlusCircleFill>:
                        <BsPlusCircle size={30}  color= {'black'}></BsPlusCircle> 
                    }

                    </button>

                    <button>
                        {
                            view === 3 ? 
                            <BsPeopleFill size={30} color= {'#c7000dff'} onClick={() => navView(3)}></BsPeopleFill>:
                            <BsPeople size={30} color= {'black'} onClick={() => setView(3)}></BsPeople>

                        }
                        
                    </button>

                </nav>
            </div>
            <div id="view" data-interactive={sideBarVisible ? "false": "true"}>
                {view === 1 &&

                    <ConversationPanel setSideBarVisible={setSideBarVisisible} sideBarVisible={sideBarVisible} />
                
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