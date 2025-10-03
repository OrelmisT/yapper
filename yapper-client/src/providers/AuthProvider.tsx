import {useState} from "react";
import type { User } from "../types";
import AuthContext from "../contexts/AuthContext";


const AuthProvider = ({children}:{children:React.ReactNode}) => {

    const [user, setUser] = useState<User | null>(null)

    // fetch user data if valid user session is active
    


    return (
        <AuthContext.Provider value={{user, setUser}}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider