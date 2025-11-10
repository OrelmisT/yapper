import { useState } from "react"
import HomeViewContext from "../contexts/HomeViewContext"



const HomeViewProvider = ({children}:{children:React.ReactNode}) =>{
    const [view, setView] = useState(1)


    return (
        <HomeViewContext.Provider value={{view, setView}}>
            {children}
        </HomeViewContext.Provider>
    )



}

export default HomeViewProvider