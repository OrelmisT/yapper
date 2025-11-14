import useAuth from "../../../hooks/useAuth"
import '../../../styles/Message.scss'

const Message = ({message}) => {
    const {user} = useAuth()


    return(<div className="message" data-isUsersPost={message.sender_id === user?.id}>
        {message.content}

    </div>)



}

export default Message