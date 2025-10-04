import combineContext from '../utils/CombineContext';
import { AuthContextProvider } from './AuthContext';
import { ChatContextProvider } from './ChatContext';
import { ThemeContextProvider } from './ThemeContext';


export const AppContextProvider = combineContext(
    AuthContextProvider,
    ChatContextProvider,
    ThemeContextProvider,
);

