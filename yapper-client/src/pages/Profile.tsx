import '../styles/Profile.scss'
import Avatar from '@mui/material/Avatar'
import { useState, useRef, useEffect } from 'react'
import useAuth from '../hooks/useAuth'
import { useNavigate } from 'react-router'
import axios from '../config/axios.config'
import  globalAxios from 'axios'


const Profile = () => {

    const {user, setUser} = useAuth()
    const nav = useNavigate()
    const [usernameInput, setUsernameInput] = useState(user?.username || '')
    const [emailInput, setEmailInput] = useState(user?.email || '')
    const [pfpUrlInput, setpfpUrlInput] = useState(user?.pfp_url || '')
    const [fileInput, setFileInput] = useState<File | null>(null)
    const [currentPasswordInput, setCurrentPasswordInput] = useState('')
    const [newPasswordInput, setNewPasswordInput] = useState('')
    const [confirmNewPasswordInput, setConfirmNewPasswordInput] = useState('')


    

    useEffect(()=>{
        if(!user){
            nav('/login', {state:{from:'/account'}})        
        }
    }, [user, nav])






    

    const imageInputRef = useRef<HTMLInputElement>(null)


    useEffect(() => {
        setUsernameInput(user?.username || '')
        setEmailInput(user?.email || '')
        setpfpUrlInput(user?.pfp_url || '')
    }, [user])

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file){
            setFileInput(file)
            const reader = new FileReader()
            reader.onloadend = (e) => {
                setpfpUrlInput(e.target?.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handlePfpClick = () => {
        imageInputRef.current?.click()
    }

    

    const handleSave = async (e) => {
        try{

            let pfp_update = false

            e.preventDefault()
            if(pfpUrlInput != (user?.pfp_url) && fileInput){
                
                const contentType = fileInput.type
                const response =  await axios.get(`/auth/pfp_upload_url?contentType=${contentType}`)
                const upload_url = response.data.pfp_upload_url
                await globalAxios.put(upload_url, fileInput, {
                    headers:{
                        'Content-Type': contentType
                    }
                })
                console.log(response.data.pfp_upload_url)
                
                pfp_update = true
            }

            const update_response = await axios.put('/auth/update_account', {
                email: emailInput,
                username: usernameInput,
                new_pfp: pfp_update
            })

            const updated_user = update_response.data.user
            setpfpUrlInput(updated_user.pfpUrl || '')
            setUser(updated_user)
            
        } catch(err){
            console.log(err)
            
        }
        
    }

    const handlePasswordReset = async (e) => {
        try{

            e.preventDefault()

            if(newPasswordInput !== confirmNewPasswordInput){
                return 
            }


            const response = await axios.put('/auth/reset_passord_logged_in', {current_password:currentPasswordInput, new_password:newPasswordInput})
            if(response.status === 200){
                setCurrentPasswordInput('')
                setNewPasswordInput('')
                setConfirmNewPasswordInput('')
            }

        }catch(e){
            console.log(e)
        }


    }



    return (
        <div id="profile-page-layout">
            <h1>Account Settings</h1>

            <h2>Profile information</h2>

            <form>
                {pfpUrlInput ? 

                <Avatar className='pfp' sx={{ width: 80, height: 80, fontSize: 40 }} style={{alignSelf:'center'}} src={pfpUrlInput} onClick={handlePfpClick}></Avatar>
                
            : user?.pfp_url ?

                <Avatar className='pfp' sx={{ width: 80, height: 80, fontSize: 40 }} style={{alignSelf:'center'}} src={user.pfp_url} onClick={handlePfpClick}></Avatar>
            
                :
                <Avatar className='pfp' sx={{ width: 80, height: 80, fontSize: 40 }} style={{alignSelf:'center'}} onClick={handlePfpClick}>O</Avatar>
            }

         
                <input type='file' onChange={handleFileChange} ref={imageInputRef} style={{display:'none'}}></input>


                <div className='input-group'>
                    <label>Username</label>
                    <input type='text' value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)}></input>
                </div>

                <div className='input-group'>

                    <label>Email</label>
                    <input type='email' value={emailInput} onChange={(e) => setEmailInput(e.target.value)}></input>
                </div>

            </form>
            
            <input type='submit' onClick={(e) => handleSave(e)} accept='image/*' value={"Save"} disabled={(usernameInput === user?.username && emailInput === user.email && pfpUrlInput === (user.pfp_url || ''))} ></input>


            <h2>Change Password</h2>
            <form>
                    <input type='password' placeholder='Current Password' value={currentPasswordInput} onChange={(e) => setCurrentPasswordInput(e.target.value)}></input>
           

               
                    <input type='password' placeholder='New Password' value={newPasswordInput} onChange={(e)=> setNewPasswordInput(e.target.value)}></input>
            
                
                    <input type='password' placeholder='Confirm New Password' value={confirmNewPasswordInput} onChange={(e) => setConfirmNewPasswordInput(e.target.value)}></input>
          

            </form>
            <input type='submit' onClick={(e)=>handlePasswordReset(e)} value={"Save"} disabled={!(currentPasswordInput && newPasswordInput && confirmNewPasswordInput)}></input>


        </div>
    )

}

export default Profile
