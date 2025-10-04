import { useState } from 'react';
import { createContext } from 'react';

const ThemeContext = createContext();

export const ThemeContextProvider = ({children})=>{
    const [theme, setTheme] = useState(null);

    return(
        <ThemeContext.Provider value={{theme, setTheme}}>
            {children}
        </ThemeContext.Provider>
    );
};


export default ThemeContext;