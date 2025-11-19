import { useState, useEffect } from "react";
import SocketContext from "../contexts/SocketContext";
import useAuth from "../hooks/useAuth";
import { io, Socket } from "socket.io-client";
import config from "../config/config";

const SocketProvider = ({children}:{children:React.ReactNode}) => {

    const {user} = useAuth()

    const [socket, setSocket] = useState<Socket>()




    useEffect(()=>{

        if(!user){
            return
        }
        const iosocket = io(config.socketURL, {withCredentials:true})
        setSocket(iosocket)


        return ()=> {iosocket.disconnect()}

    }, [user])



    return(<SocketContext.Provider value={socket}>
        {children}
    </SocketContext.Provider>)
}





export default SocketProvider


// useEffect(() => {

//         if(!user){
//             return
//         }

//         const iosocket =  io(config.socketURL, {withCredentials:true})
//         iosocket.on("connect", () => {
            
//             console.log("connected")
//         })

//         iosocket.on('new_message', (newMessage) => {

            
//             queryClient.setQueryData(['conversations', newMessage.conversation_id, "messages"], (prev:[]) =>{

//                 if(!prev){
//                     return [newMessage]
//                 }
//                 else{
//                     return [...prev, newMessage]
//                 }

//             })
            

//         })

//         setSocket(iosocket)
        


//         return () => {iosocket.disconnect()}

//     }, [user, queryClient])