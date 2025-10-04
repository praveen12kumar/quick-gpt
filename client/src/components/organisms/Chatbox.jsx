import useAuth from '../../hooks/context/useAuth';
import useChat from '../../hooks/context/useChat';
import useTheme from '../../hooks/context/useTheme';


const Chatbox = () => {
  const {user} = useAuth();
  const {chat, selectedChat} = useChat();
  const {theme} = useTheme();

  console.log('user chat selectedChat theme', user, chat, selectedChat, theme);


  return (
    <div>Chatbox</div>
  );
};

export default Chatbox;