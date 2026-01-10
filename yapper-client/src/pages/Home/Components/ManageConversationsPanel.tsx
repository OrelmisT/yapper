import {useState, useEffect, useMemo, useRef} from 'react'
import {faSearch, faX} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import '../../../styles/ManageConversationsPanel.scss'
import axios from '../../../config/axios.config.js'
import { Avatar } from '@mui/material';
import type {User} from '../../../types.js'
import type { Conversation } from '../../../types.js';
import useConversations from '../../../hooks/useConversations.js';
import useSocket from '../../../hooks/useSocket.js';
import useView from '../../../hooks/useView.js';
import useAuth from '../../../hooks/useAuth.js';
import useFriends from '../../../hooks/useFriends.js';
import Fuse from 'fuse.js'
import { BiSolidImageAdd } from "react-icons/bi";


const ManageConversationsPanel =() => {

    const [userSearchInput, setUserSearchInput] = useState('')
    const [selectedUsers, setSelectedUsers] = useState<User[]>([])
    const [newMessageInput, setNewMessageInput] = useState('')
    const [showResults, setShowResults] = useState(false)
    const {friends} = useFriends()

    const {conversations, setConversations, setSelectedConversation} =useConversations()
    const socket = useSocket()
    const {setView} = useView()
    const {user} = useAuth()
    const uploadImageInputRef = useRef<HTMLInputElement>(null)
    const [messageInput, setMessageInput] = useState('')
    const [imageFiles, setImageFiles] = useState<File[]>([])
    const [imageFileUrls, setImageFileUrls] = useState<string[]>([])

    
    const filteredFriends = useMemo(() => {
         const fuse = new Fuse(friends,{
            keys:["username"],
            threshold:0.3,
            ignoreLocation: true
        })


        const result = fuse.search(userSearchInput).map(r => r.item)
        console.log(`result: ${result.map(u => u.username)}`)
        return result
    },[friends, userSearchInput])


    




    useEffect(()=>{
        if(userSearchInput.length > 0){
            setShowResults(true)

        }else{
            setShowResults(false)
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



    const handleImageUpload = (e) =>{

        e.preventDefault()
        // alert("JE")

        if(!uploadImageInputRef.current){
            return
        }
        uploadImageInputRef.current.click()
    }



    const handleFileChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        if(!e.target.files){
            return
        }

        const filesArray = Array.from(e.target.files)
        setImageFiles(prev => [...prev, ...filesArray])
        const fileUrlsArray = filesArray.map(file => URL.createObjectURL(file))
        setImageFileUrls(prev => [...prev, ...fileUrlsArray])

        console.log(fileUrlsArray)
    }


    const handleEnterPress = (e:React.KeyboardEvent<HTMLTextAreaElement>) => {
        if(e.key === 'Enter' && !e.shiftKey){
            e.preventDefault()
            handleSend(e)
        }

    }

    const handleSend = (e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLTextAreaElement>) => {
        e.preventDefault()
        if(messageInput.trim() === '' && imageFiles.length === 0){
            return
        }

        // createNewMessageMutation.mutate()
        //TODO: handle creation of new message with images

    }


    



    return (
        <div id='manage-conversation-panel-page' style={{width:'100%'}}>
            <div style={{padding:'1rem', borderBottom:'1px solid '}}>

                <div>
                    <h1>Start a New Conversation</h1>
                    <p style={{textAlign:'left', fontSize:'1rem'}}>Search for someone to chat with</p>
                </div>
                <div className="input-container" >
                        <FontAwesomeIcon id="search_icon_users" icon={faSearch} />
                        <input value={userSearchInput} onChange={(e) =>setUserSearchInput(e.target.value) } placeholder="Search Friends..."></input>
                </div>
            </div>

            {

                selectedUsers.length > 0 &&

                <div id='selected-users-container' style={{display: selectedUsers.length > 0 ? 'flex' : 'none', paddingLeft:'1rem', paddingRight:'1rem'}}>
                    {selectedUsers.map((user) => <SelectedUser key={user.id} user={user} setSelectedUsers={setSelectedUsers} ></SelectedUser>)}


                </div>  
            }

            <h2 style={{paddingLeft:'1rem', paddingRight:'1rem'}}>Your Friends</h2>
            <div id='search-results'>

                {showResults ?
                    // loading ? <div style={{display:'flex', paddingTop:'8rem', justifyContent:'center'}}>
                    //                             <CircularProgress color="error"/> 
                    //                         </div>
                    //         : 

                    <>
                        {filteredFriends.length > 0 ? filteredFriends.map((user) => <UserResult key={user.id} user={user} setSelectedUsers={setSelectedUsers} selectedUsers={selectedUsers}></UserResult>) : <h3>No Results Found</h3>}
                        <button className="clear-search" onClick={()=> setUserSearchInput('')}>Clear Search</button>
                    </>
                : 
                
                <>
                    {/* <h2>Your Friends</h2> */}
                    {friends.map(friend => <UserResult key={friend.id} user={friend} setSelectedUsers={setSelectedUsers} selectedUsers={selectedUsers}></UserResult>)}
                    
                </>
                }

                
                

            </div>


            <div id='confirm-conversation-container'>

                <textarea id='initial-message-input' value={newMessageInput} onChange={(e) => setNewMessageInput(e.target.value)} placeholder='Type a message (optional)'></textarea>

                <div className='buttons'>
                    <button id='cancel-create-convo' >Cancel</button>
                    <button onClick={() => handleSubmit()} disabled={selectedUsers.length === 0} id='confirm-create-convo' >Create</button>    
                </div>

                {/* <form style={{all:'unset'}} onSubmit={(e) => handleSend(e)} >
                
                    { imageFileUrls.length > 0 &&

                        <div className="image-selection-container">
                        {imageFileUrls.map((url, index) => <ImageSelectionPreview key={index} imageUrl={url} setImageFileUrls={setImageFileUrls} setImageFiles={setImageFiles} imageUrls={imageFileUrls}></ImageSelectionPreview>)}
                    </div>
                    }
                    <div className="input-container">
                        <button id="add-button"  onClick={(e) => handleImageUpload(e)}>
                            <BiSolidImageAdd className="add-icon"></BiSolidImageAdd>
                        </button>
                        <input ref={uploadImageInputRef} accept="image/*" multiple onChange={(e) => handleFileChange(e)} type="file" style={{display:'none'}}></input>
                        <textarea placeholder="New Message" value={messageInput} onKeyDown={(e) => handleEnterPress(e)} onChange={(e) => setMessageInput(e.target.value)}></textarea>
                        <button type="submit">Send</button>
                    </div>
                </form> */}


            </div>

        </div>
    )

}

export default ManageConversationsPanel


const SelectedUser = ({user, setSelectedUsers}:{user:User, setSelectedUsers:React.Dispatch<React.SetStateAction<User[]>>}) => {




    return(<div className='selected-user-card'>
        <p>{user.username}</p>
        <FontAwesomeIcon className='x' icon ={faX} color='#C29EA0' onClick={() => setSelectedUsers((prev) => prev.filter((u) => u.id !== user.id))}></FontAwesomeIcon>
    </div>)
}


const UserResult = ({user, setSelectedUsers, selectedUsers}:{user:User, setSelectedUsers:React.Dispatch<React.SetStateAction<User[]>>, selectedUsers:User[]}) => {


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