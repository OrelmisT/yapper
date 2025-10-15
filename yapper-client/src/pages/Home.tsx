import useAuth from "../hooks/useAuth"
import { useEffect } from "react"
import { useNavigate } from "react-router"
import '../styles/Home.css'

const Home = () => {

    const nav = useNavigate()
    const {user} = useAuth()

    useEffect(()=>{
        if(!user){
            nav('/login')        
        }
    }, [user, nav])

    



    return(
        <h1>This is the Home page</h1>
    )
}

export default Home