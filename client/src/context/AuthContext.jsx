import { createContext } from 'react';
import { useState } from 'react';
const AuthContext = createContext();


export const AuthContextProvider = ({children})=>{
    const [user, setUser] = useState('hello');
    
    
    return (
        <AuthContext.Provider value={{user, setUser}}>
            {children}
        </AuthContext.Provider>
    );
};


export default AuthContext;