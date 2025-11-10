import { createContext } from "react";
import type {User} from '../types'


const FriendsContext = createContext<{
    friends:User[],
    receivedFriendRequests: User[],
    sentFriendRequests:User[],
    setFriends: (friends: User[] ) => void,
    setReceivedFriendRequests: (receivedRequests:User[] ) => void,
    setSentFriendRequests: (sentRequests:User[]) => void

}>({
    friends: [],
    receivedFriendRequests: [],
    sentFriendRequests: [],
    setFriends: () => {},
    setReceivedFriendRequests: () => {},
    setSentFriendRequests: () => {} 
})


export default FriendsContext