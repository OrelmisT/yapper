import {useState} from 'react'
import {faSearch} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'

const ManageConversationsPanel =() => {

    const [userSearchInput, setUserSearchInput] = useState('')



    return (
        <div style={{width:'100%'}}>
            <h1>Start a New Conversation</h1>
            <p style={{textAlign:'left', fontSize:'1rem'}}>Search for someone to chat with</p>
            <div className="input-container">
                    <FontAwesomeIcon id="search_icon_users" icon={faSearch} />
                    <input value={userSearchInput} onChange={(e) =>setUserSearchInput(e.target.value) } placeholder="Search Users..."></input>
            </div>

        </div>
    )

}

export default ManageConversationsPanel