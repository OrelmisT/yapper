import type {User} from '../../../types'
import { useEffect, useState } from 'react'
import useFriends from '../../../hooks/useFriends'
import useAuth from '../../../hooks/useAuth'
import axios from '../../../config/axios.config'
import {Avatar} from '@mui/material'
import useConversations from '../../../hooks/useConversations'
import type { Conversation } from '../../../types'
import useView from '../../../hooks/useView'
import useSocket from '../../../hooks/useSocket'

const UserCard = ({user}:{user:User}) => {




    const current_user = useAuth().user
    const {setSelectedConversation} = useConversations()

    const {friends, sentFriendRequests, receivedFriendRequests,
         setFriends, setSentFriendRequests, setReceivedFriendRequests} = useFriends()

    
    const [isFriend, setIsFriend] = useState(false)
    const [sentRequest, setSentRequest] = useState(false)
    const [receivedRequest, setReceivedRequest] = useState(false)
    const {conversations, setConversations} = useConversations()
    
    const {setView} = useView()

    const socket = useSocket()



    useEffect(()=>{

        setIsFriend(friends.some(friend => friend.id === user.id) )
        setSentRequest(sentFriendRequests.some(receiver => receiver.id === user.id))
        setReceivedRequest(receivedFriendRequests.some(sender => sender.id === user.id))


    }, [friends, sentFriendRequests, receivedFriendRequests, user.id])


    const sendFriendRequest = async() => {
        try{
            const response = await axios.post('/friends/friend_requests', {'sender_id':current_user?.id, 'receiver_id': user.id})
            if(response.status === 201){
                setSentFriendRequests([...sentFriendRequests, user])
            }
        }catch(e){
            console.log(e)
        }

    }

    const cancelFriendRequest = async () => {
        try{
            const response = await axios.delete(`/friends/friend_requests?sender_id=${current_user?.id}&receiver_id=${user.id}`)
            if(response.status === 200){
                setSentFriendRequests(sentFriendRequests.filter(requestee => requestee.id !== user.id))
            }

        }catch(e){
            console.log(e)

        }

    }

    const rejectFriendRequest = async () => {
        try{

            const response = await axios.delete(`/friends/friend_requests?sender_id=${user.id}&receiver_id=${current_user?.id}`)
            if(response.status === 200){
                setReceivedFriendRequests(receivedFriendRequests.filter(sender => sender.id != user.id))
            }
        }catch(e){
            console.log(e)
        }

    }
    
    const acceptFriendRequest = async () => {
        try{

            const response =  await axios.post('/friends/friendships', {'sender_id': user.id, 'receiver_id': current_user?.id})
            if (response.status === 201){
                setFriends([...friends, user])
                setReceivedFriendRequests(receivedFriendRequests.filter(sender => sender.id != user.id))
            }

        }catch(e){
            console.log(e)

        }

    }

    const unfollow = async () => {
        try{
            const response = await axios.delete(`/friends/friendships?user_id_1=${current_user?.id}&user_id_2=${user.id}`)
            if (response.status === 200){
                setFriends(friends.filter(friend => friend.id !== user.id))
            }
            
        }catch(e){
            console.log(e)
        }



    }

    const handleMessage = async () => {

    

        // First check if a one on one conversation with this user exists already
        const matchingConversation = conversations.find((convo: Conversation) => {
            if(convo.members.length !== 2){
                return false
            }

            return convo.members.find((member) => member.id === user.id)
        })

        if(matchingConversation){
            setSelectedConversation(matchingConversation)
            setView(1)
            return
        }


        // otherwise, create a new conversation with this user
        try{
            const response = await axios.post('/conversations', {name:'', members:[user, current_user]})
            const conversation:Conversation = response.data.conversation
            setConversations([...conversations, conversation])
            setSelectedConversation(conversation)
            setView(1)
            socket?.emit("notify_new_convo", {conversation, user_ids:[user.id]})
         
        }catch(e){
            console.log(e)
        }


    }

    


    return (
        <div className="userSearchResult" style={{overflow:'visible'}}>
            <div className="pfp-name-group">
                {
                    user.pfp_url ?
                    <Avatar src={user.pfp_url}></Avatar>
                    
                    :

                    <Avatar>{user.username[0].toUpperCase()}</Avatar>
                }

                <p>{user.username}</p>
            </div>

            <div className="button-group">

                { current_user?.id === user.id ? 

                    <button className="manage-user-button" onClick={() => handleMessage()}>Message</button>
                
                
                  :isFriend ? 
                    <>
                        <button className="manage-user-button secondary" onClick={() => unfollow()}>Unfollow</button>
                        <button className="manage-user-button" onClick={() => handleMessage()}>Message</button>
                    </>
                    :

                        receivedRequest ?  
                            <>
                                <button className="manage-user-button secondary" onClick={() => rejectFriendRequest()}>Reject</button>
                                <button className="manage-user-button" onClick={() => acceptFriendRequest()}>Accept</button>
                            </> :

                            sentRequest ?
                            <>
                                <button className="manage-user-button secondary"onClick={() => cancelFriendRequest()}>Cancel</button>
                                <button className="manage-user-button requested" disabled >Requested</button>
                            </>
                                :
                                <button className="manage-user-button" onClick={() => sendFriendRequest()}>Follow</button>
                
                }

            </div>
        </div>
    )

}

export default UserCard