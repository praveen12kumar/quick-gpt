import { createContext, useEffect } from 'react';
import { useState } from 'react';

import { dummyChats } from '../assets/assets';
import useAuth from '../hooks/context/useAuth';


const ChatContext = createContext();


export const ChatContextProvider = ({children})=>{
    const {user} = useAuth();
    
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    
    const fetchUsersChats = async()=>{
        setChats(dummyChats);
        setSelectedChat(dummyChats[0]);
    };

    useEffect(()=>{
       if(user){
        fetchUsersChats();
       }
       else{
        setChats([]);
        setSelectedChat(null);
       }
    },[user]);


    return (
        <ChatContext.Provider value={{chats, setChats, selectedChat, setSelectedChat}}>
            {children}
        </ChatContext.Provider>
    );
};



export default ChatContext;