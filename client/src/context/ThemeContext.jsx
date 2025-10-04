import { useEffect, useState } from 'react';
import { createContext } from 'react';

const ThemeContext = createContext();

export const ThemeContextProvider = ({children})=>{
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(()=>{
        if(theme === 'dark'){
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
        else{
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
        localStorage.setItem('theme', theme);
    },[theme]);


    return(
        <ThemeContext.Provider value={{theme, setTheme}}>
            {children}
        </ThemeContext.Provider>
    );
};


export default ThemeContext;