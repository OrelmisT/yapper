import {useState, useEffect} from 'react'
import {faSearch, faX} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import '../../../styles/ManageConversationsPanel.scss'
import CircularProgress from '@mui/material/CircularProgress';
import axios from '../../../config/axios.config.js'
import { Avatar } from '@mui/material';
import type {User} from '../../../types.js'
import type { Conversation } from '../../../types.js';
import useConversations from '../../../hooks/useConversations.js';
import useSocket from '../../../hooks/useSocket.js';
import useView from '../../../hooks/useView.js';
import useAuth from '../../../hooks/useAuth.js';

const ManageConversationsPanel =() => {

    const [userSearchInput, setUserSearchInput] = useState('')
    const [loading, setloading] = useState(false)
    const [results, setResults] = useState<User[]>([])
    const [selectedUsers, setSelectedUsers] = useState<User[]>([])
    const [newMessageInput, setNewMessageInput] = useState('')
    const [showResults, setShowResults] = useState(false)

    const {conversations, setConversations, setSelectedConversation} =useConversations()
    const socket = useSocket()
    const {setView} = useView()
    const {user} = useAuth()


    




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


    const handleSubmit = async () => {
        const response = await axios.post('/conversations', {name:'', members:[...selectedUsers, user], init_message: newMessageInput ? {content:newMessageInput, type:'text'}: null})
        const conversation:Conversation = response.data.conversation
        setConversations([...conversations, conversation])
        setSelectedConversation(conversation)
        await socket?.emit("notify_new_convo", {conversation, user_ids:selectedUsers.map(u => u.id)})
        setView(1)

    }



    return (
        <div id='manage-conversation-panel-page' style={{width:'100%'}}>
            <div>
                <h1>Start a New Conversation</h1>
                <p style={{textAlign:'left', fontSize:'1rem'}}>Search for someone to chat with</p>
            </div>
            <div className="input-container" >
                    <FontAwesomeIcon id="search_icon_users" icon={faSearch} />
                    <input value={userSearchInput} onChange={(e) =>setUserSearchInput(e.target.value) } placeholder="Search Users..."></input>
            </div>

            {

                selectedUsers.length > 0 &&

                <div id='selected-users-container' style={{display: selectedUsers.length > 0 ? 'flex' : 'nonde'}}>
                    {selectedUsers.map((user) => <SelectedUser key={user.id} user={user} setSelectedUsers={setSelectedUsers} ></SelectedUser>)}


                </div>  
            }

            <div id='search-results'>

                {showResults ?
                    loading ? <div style={{display:'flex', paddingTop:'8rem', justifyContent:'center'}}>
                                                <CircularProgress color="error"/> 
                                            </div>
                            : 

                    <>
                        {results.length > 0 ? results.map((user) => <UserResult key={user.id} user={user} setSelectedUsers={setSelectedUsers} selectedUsers={selectedUsers}></UserResult>) : <h1>No Results Found</h1>}
                        <button className="clear-search" onClick={()=> setUserSearchInput('')}>Clear Search</button>
                    </>
                : 
                
                <>
                    <h1>Empty</h1>
                    <h1>Empty</h1>
                    <h1>Empty</h1>
                    <h1>Empty</h1>
                    <h1>Empty</h1>
                    <h1>Empty</h1>
                    <h1>Empty</h1>
                    <h1>Empty</h1>
                    <h1>Empty</h1>

                    <h1>Empty</h1>
                    <h1>Empty</h1>
                    <h1>Empty</h1>
                    <h1>Empty</h1>
                    <h1>Empty</h1>
                </>
                }

                
                

            </div>


            <div id='confirm-conversation-container'>

                <textarea id='initial-message-input' value={newMessageInput} onChange={(e) => setNewMessageInput(e.target.value)} placeholder='Type a message (optional)'></textarea>

                <div className='buttons'>
                    <button id='cancel-create-convo' >Cancel</button>
                    <button onClick={() => handleSubmit()} disabled={selectedUsers.length === 0} id='confirm-create-convo' >Create</button>    
                </div>


            </div>

        </div>
    )

}

export default ManageConversationsPanel


const SelectedUser = ({user, setSelectedUsers}) => {




    return(<div className='selected-user-card'>
        <p>{user.username}</p>
        <FontAwesomeIcon className='x' icon ={faX} color='#C29EA0' onClick={() => setSelectedUsers((prev) => prev.filter((u) => u.id !== user.id))}></FontAwesomeIcon>
    </div>)
}


const UserResult = ({user, setSelectedUsers, selectedUsers}) => {


    const [isSelected, setIsSelected] = useState(false)

    useEffect(() => {
        const found = selectedUsers.find((u) => u.id === user.id) ? true : false
        setIsSelected(found)
    }, [selectedUsers, user.id])



    return(<div className='userSearchResult'>

        <div className='pfp-name-group'>
            {user.pfp_url ? 
                <Avatar src={user.pfp_url}></Avatar>
                :
                <Avatar>{user.username[0].toUpperCase()}</Avatar>
            }
            
            <p>{user.username}</p>
        </div>
        <div className='button-group'>
            {isSelected ? 
            <button className='secondary' onClick={() => setSelectedUsers(selectedUsers.filter(u => u.id !== user.id))}>Remove</button>
            :
            <button  onClick={() => setSelectedUsers([...selectedUsers, user])}>Add</button>
        }
        </div>

    </div>)
}