import { useEffect, useState } from "react"
import useFriends from "../../../hooks/useFriends"
import type {User} from '../../../types'
import CircularProgress from '@mui/material/CircularProgress';
import axios from '../../../config/axios.config'
import UserCard from "./UserCard";
import {faSearch} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'

const ManageFriendsPanel = () => {

    const {friends, receivedFriendRequests, sentFriendRequests} = useFriends()



    const [userSearchInput, setUserSearchInput] = useState('')
    const [loading, setloading] = useState(false)
    const [showResults, setShowResults] = useState(false)
    const [results, setResults] = useState<User[]>([])


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
        <div style={{width:'100%'}}>
                <h1>Manage Friends</h1>
                <p style={{textAlign:'left', fontSize:'1rem'}}>Add friends and manage requests</p>
                <div className="input-container">
                    <FontAwesomeIcon id="search_icon_users" icon={faSearch} />
                    <input value={userSearchInput} onChange={(e) =>setUserSearchInput(e.target.value) } placeholder="Search Users..."></input>
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
                </>
                  
                }
                
            </div>
        
    )
}

export default ManageFriendsPanel