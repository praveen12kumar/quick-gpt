import { createContext } from 'react';
import { useState } from 'react';


const ChatContext = createContext();


export const ChatContextProvider = ({children})=>{

    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    



    return (
        <ChatContext.Provider value={{chats, setChats, selectedChat, setSelectedChat}}>
            {children}
        </ChatContext.Provider>
    );
};



export default ChatContext;