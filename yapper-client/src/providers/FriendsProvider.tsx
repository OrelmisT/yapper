import { useState } from "react";
import React from "react";
import FriendsContext from "../contexts/FriendsContext";
import type {User} from '../types'

const FriendsProvider = ({children}:{children:React.ReactNode}) => {

    const [friends, setFriends] = useState<User[]>([])
    const [sentFriendRequests, setSentFriendRequests] = useState<User[]>([]) 
    const [receivedFriendRequests, setReceivedFriendRequests] = useState<User[]>([])





    return(
    <FriendsContext.Provider value={{friends, setFriends, sentFriendRequests, setSentFriendRequests,
     receivedFriendRequests, setReceivedFriendRequests}} >
        
 
        {children}

    </FriendsContext.Provider>
    )

    
}


export default FriendsProvider