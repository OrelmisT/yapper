import {useState} from "react";
import type { User } from "../types";
import AuthContext from "../contexts/AuthContext";
import axios from '../config/axios.config'
import { useEffect } from "react";


const AuthProvider = ({children}:{children:React.ReactNode}) => {

    const [user, setUser] = useState<User | null>(null)

    // fetch user data if valid user session is active
    useEffect(() =>{

        const fetchUser = async () => {
            const response = await axios.get('/auth/whoami')
            if(response.status === 200){
                setUser(response.data.user)
            }
        }

        fetchUser()
        
    }, [])
    
    


    return (
        <AuthContext.Provider value={{user, setUser}}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider