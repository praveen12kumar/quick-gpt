import { createContext, useEffect } from 'react';
import { useState } from 'react';
const AuthContext = createContext();
import { dummyUserData } from '../assets/assets';

export const AuthContextProvider = ({children})=>{
    const [user, setUser] = useState(null);

    const fetchUser = async()=>{
        setUser(dummyUserData);
    };

    useEffect(()=>{
        fetchUser();
    },[]);
    
    
    return (
        <AuthContext.Provider value={{user, setUser}}>
            {children}
        </AuthContext.Provider>
    );
};


export default AuthContext;