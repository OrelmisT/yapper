import { NavLink, Outlet } from "react-router"
import '../styles/NavLayout.css'
import axios from "../config/axios.config"
import useAuth from "../hooks/useAuth"

const NavLayout = () => {

    const {setUser} = useAuth()

    const signOut = async () => {
        try{  
            const response = await axios.post('/auth/logout')
            if(response.status === 200){
                setUser(null)
            }

        }catch(e){
            console.log(e)
        }
    }
    


    return(
        <>
        <header>
            <NavLink to={'/'}>

                <img src="logo.png"></img>
            </NavLink>
            <nav>
                <NavLink to={'/'}>Home</NavLink>
                <NavLink to={'/profile'}>Profile</NavLink>
                <p onClick={signOut}>Logout</p>

            </nav>

        </header>
         <Outlet />
        </>
    )

}

export default NavLayout