import useConversations from "../../../hooks/useConversations"

const ConversationPanel = () => {

    const {selectedConversation} = useConversations()



    return (<div id="conversationPanel">

        {
            selectedConversation  ?<h1>Not Empty</h1> :<h1>Empty</h1>
        }


    </div>)

}


export default ConversationPanel