import {useState} from "react";
import type { User } from "../types";
import AuthContext from "../contexts/AuthContext";
import axios from '../config/axios.config'
import { useEffect } from "react";


const AuthProvider = ({children}:{children:React.ReactNode}) => {

    const [user, setUser] = useState<User | null>(null)
    const [loading, setloading] = useState(true)

    // fetch user data if valid user session is active
    useEffect(() =>{

        const fetchUser = async () => {
            try{

                const response = await axios.get('/auth/whoami')
                if(response.status === 200){
                    setUser(response.data.user)
                }
                
            }catch(e){
                console.log(e) // either no session or some error occured while fetching userm so assume no session
            }
            setloading(false)
        }

        fetchUser()
        
    }, [])
    
    

    return (

        
        <AuthContext.Provider value={{user, setUser}}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export default AuthProvider