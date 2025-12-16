import { useEffect, useState } from "react"
import useFriends from "../../../hooks/useFriends"
import type {User} from '../../../types'
import CircularProgress from '@mui/material/CircularProgress';
import axios from '../../../config/axios.config'
import UserCard from "./UserCard";
import {faSearch} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import '../../../styles/ManageFriendsPanel.scss'

const ManageFriendsPanel = () => {

    const {friends, receivedFriendRequests, sentFriendRequests} = useFriends()



    const [userSearchInput, setUserSearchInput] = useState('')
    const [loading, setloading] = useState(false)
    const [showResults, setShowResults] = useState(false)
    const [results, setResults] = useState<User[]>([])

    const showAllReceivedRequests = useState(false)
    const showAllSentRequests = useState(false)
    const showAllFirends = useState(false)


    useEffect(()=>{


        if(userSearchInput.length > 0){
            setloading(true)
            setShowResults(true)

        }else{
            setloading(false)
            setShowResults(false)
        }
        

        const timer = setTimeout(async() => {
            if(userSearchInput.length === 0){
                return 
            }

            try{
            
                const response = await axios.get(`/friends/users?username_query=${userSearchInput}`)

                setResults(response.data.users)

            }catch(e){
                console.log(e)
            }

            setloading(false)


        }, 400)

        return ()=> {
            clearTimeout(timer)    
        }

    }, [userSearchInput])



    return(
        <div id="manage-friends-panel" style={{width:'100%'}}>
                <div id="manage-friends-header">
                    <h1>Manage Friends</h1>
                    <p style={{textAlign:'left', fontSize:'1rem'}}>Add friends and manage requests</p>
                    <div className="input-container">
                        <FontAwesomeIcon id="search_icon_users" icon={faSearch} />
                        <input value={userSearchInput} onChange={(e) =>setUserSearchInput(e.target.value) } placeholder="Search Users..."></input>
                    </div>
                </div>
                {showResults ? 
                  <div>
                     {loading ?
                        <div style={{display:'flex', paddingTop:'12rem', justifyContent:'center'}}>
                            <CircularProgress color="error"/> 
                        </div>
                     
                     :

                     <div>
                        {results.length > 0 ? 
                        
                        <div className="results-group">
                             {results.map((user) =><UserCard user={user}></UserCard>)}
                        </div>
                        
                        : <h1>No Results</h1>}

                        <button className="clear-search" onClick={()=> setUserSearchInput('')}>Clear Search</button>


                     </div>
                     
                     
                     }
                  </div>

                  :
                <>
                  {
                      friends.length > 0 &&      
                      <>
                        <h2>Your Friends</h2>
                        <div className="results-group existing-group">
                            {friends.map((friend) => <UserCard key={friend.id} user={friend}></UserCard>)}
                        </div>
                      </>
                    }
                  {receivedFriendRequests.length > 0 && 

                    <>
                        <h2>Received Friend Requests</h2>
                        <div className="results-group existing-group">
                            {receivedFriendRequests.map((sender) => <UserCard key={sender.id} user={sender}></UserCard>)}
                        </div>
                    </>
                  
               }
                  {sentFriendRequests.length > 0 && 

                    <>
                        <h2>Sent Friend Requests</h2>
                        <div className="results-group existing-group">
                            {sentFriendRequests.map((receiver) => <UserCard key={receiver.id} user={receiver}></UserCard>)}
                        </div>  
                    </>
                }

                {
                    (sentFriendRequests.length === 0 && receivedFriendRequests.length === 0 && friends.length  === 0) &&
                    <div id="empty-friends-list">
                        <img src="empty_friends.png"></img>
                         <h1 style={{fontSize:'1rem', color:'#843138ff'}}>Add Frients to Start Yapping With!</h1>
                    </div>
                }
                </>
                  
                }
                
            </div>
        
    )
}

export default ManageFriendsPanel