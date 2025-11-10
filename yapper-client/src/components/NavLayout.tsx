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
        <div className="full_page_layout">
            <header>
                <NavLink to={'/'}>

                    <img src="logo.png"></img>
                </NavLink>
                <nav>
                    <NavLink className={ ({isActive}) => isActive ? 'navlink isActive'  : 'navlink'}  to={'/'}>Home</NavLink>
                    <NavLink className={({isActive}) => isActive ? 'navlink isActive'  : 'navlink'} to={'/account'}>Account</NavLink>
                    <p id="logout-button" onClick={signOut}>Logout</p>

                </nav>

            </header>
            <div className="page_content">

                <Outlet />
            </div>
        </div>
    )

}

export default NavLayout