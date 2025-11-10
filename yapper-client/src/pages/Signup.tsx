import useAuth from "../hooks/useAuth"
import { useNavigate } from "react-router"
import { useEffect, useState } from "react"
import axios from '../config/axios.config'

const Signup = () => {

    const {user, setUser} = useAuth()
    const [email_input, set_email_input] = useState('')
    const [username_input, set_username_input] = useState('')
    const [password_input, set_password_input] = useState('')
    const [password_visible, set_password_visible] = useState(false)
    const nav = useNavigate()

    useEffect(()=> {

        if(user){
            nav('/')
        }


    }, [user, nav])

    const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) =>{
        e.preventDefault()
        try{
            const response = await axios.post('/auth/signup', {email:email_input, username:username_input, password: password_input})
            if(response.status === 201){
                const user = response.data.user
                console.log(user)
                setUser(user)
            }
            console.log(response.status)

        }catch(e){
            console.log(e)
            return
        }

    }


    return (<div id="page-content">
        <form onSubmit={handleSubmit}>
            <img src="logo.png" />
            <h1>Sign Up</h1>
            <div className="input-group"> 
                <label>Email</label>
                <input type="email" name="email" value={email_input} onChange={(e) => set_email_input(e.target.value) } />
            </div>
            <div className="input-group">
                <label>Username</label>
                <input type="text" name="username" value={username_input} onChange={(e) => set_username_input(e.target.value)} />
            </div>
            <div className="input-group">
                <label>Password</label>
                <input type={password_visible ? 'text': 'password'} name="password" value={password_input} onChange={(e) =>set_password_input(e.target.value)}/>
            </div>

            <input type="submit" value={"Sign Up"}></input>

            <a>Forgot Password?</a>

            <p>Don't have an account? <a onClick={() => nav('/login')}>Login</a></p>
            

        </form>
    
    
    </div>)
}

export default Signup