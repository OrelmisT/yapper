import { useEffect, useState } from "react"
import useAuth from "../hooks/useAuth"
import axios from '../config/axios.config'
import '../styles/Login.css'
import { useLocation, useNavigate } from "react-router"


const Login = () => {

    const [password_visible, setPasswordVisible] = useState(false)
    const [email_input, set_email_input] = useState('')
    const [password_input, set_password_input] = useState('')
    const nav = useNavigate()


    const {user, setUser} = useAuth()

    const location = useLocation()



    
    useEffect(() => {
        if(user){
            nav(location.state?.from || '/' )
        }

    }, [user, location.state?.from, nav])

    
    


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        try{
            const response = await axios.post('/auth/login', {email:email_input, password:password_input})
            if(response.status === 200){
                const user = response.data.user
                setUser(user)

            }
        }catch(e){
            console.log(e)
            return
        }
    }
    

    return (
        <div id="page-content">
            <form onSubmit={handleSubmit}>
            <img src="logo.png" />
                <h1>Login</h1>
                <div className="input-group"> 
                    <label>Email</label>
                    <input type="email" name="email" value={email_input} onChange={(e) => set_email_input(e.target.value) } />
                </div>
                <div className="input-group">
                    <label>Password</label>
                    <input type={password_visible ? 'text': 'password'} name="password" value={password_input} onChange={(e) =>set_password_input(e.target.value)}/>
                </div>

                <input type="submit" value={"Log In"}></input>

                <a>Forgot Password?</a>

                <p>Don't have an account? <a onClick={() => nav('/signup')}>Sign up</a></p>
            </form>
        
        </div>
    )



}

export default Login