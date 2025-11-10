import { useContext } from "react"
import FriendsContext from "../contexts/FriendsContext"


const useFriends = ()=> {


    return useContext(FriendsContext)


}



export default useFriends