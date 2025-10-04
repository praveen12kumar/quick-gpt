import {Plus, SearchIcon} from 'lucide-react';
import moment from 'moment';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { assets } from '../../assets/assets';
import useAuth from '../../hooks/context/useAuth';
import useChat from '../../hooks/context/useChat';
import useTheme from '../../hooks/context/useTheme';
import Button from '../atoms/Button';
import Image from '../atoms/Image';
import Input from '../atoms/Input';


const Sidebar = () => {
  const {user} = useAuth();
  const {chats} = useChat();
  const {theme, setTheme} = useTheme();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');

  function handleNewChat(){

  }

  return (
    <div className='flex flex-col h-screen min-w-72 p-5 dark:bg-gradient-to-b from [#242124]/30 to [#000000]/30 border-r border-[#80609F]/30
      backdrop-blur-3xl transition-all duration-300 max-md:absolute left-0 z-1
    '>
      <Image src={theme === 'dark' ? assets.logo_full : assets.logo_full_dark }
        alt='logo' className='w-full max-w-40'
      />

      {/* New Chat Button */}
      <Button text='New Chat' icon = {Plus} style2='size-4 mr-4'
        onClick={handleNewChat}
        style1='flex justify-center items-center w-full py-2 mt-10 text-white bg-gradient-to-r from-[#A4567F] to-[#3D81F6] text-sm rounded-md cursor-pointer'
      />

      {/* Search conversations */}
      <div className="flex items-center gap-2 p-3 mt-4 border border-gray-400 dark:border-white/20 rounded-md">
        <SearchIcon className='w-4 text-gray-400 dark:text-white/20'/>
        <Input 
          onChange={(e) => setSearch(e.target.value)}
          value={search}
          placeholder='search' 
          type='text' 
          style='text-sm placeholder:text-gray-400 outline-none'
          />
      </div>

      {/* Recent chats */}
      {
        chats.length > 0 && (<p className='mt-4 mb-2 text-sm font-medium'>Recent Chats</p>)
      }
      <div className="flex  flex-col gap-2">
        {
          chats.length > 0 && 
            chats.filter((chat)=> chat.messages[0] ? chat.messages[0]?.content.toLowerCase().includes(search.toLowerCase()) : 
            chat.name.toLowerCase().includes(search.toLowerCase())).map((chat)=>(
              <div key={chat._id}
                className="flex justify-between items-center group p-1 px-4 dark:bg-[#57317C]/10 border border-gray-300 dark:border-[#80609F]/15 rounded-md cursor-pointer"
              >
                <div className="">
                  <p className='trucate w-full'>
                    {chat.messages.length > 0 ? chat.messages[0].content.slice(0, 32) : chat.name}
                  </p>
                  <p className='text-xs text-gray-400 dark:text-[#B1A6C0]'>{moment(chat.updatedAt).fromNow()}</p>
                </div>
                <img src={assets.bin_icon}  alt="" className='hidden group-hover:block size-4 cursor-pointer not-dark:invert'
                 />
              </div>
            ))
          
        }
        
      </div>

        {/* community Images */}
      <div 
        onClick={()=> navigate('/community') }
        className="w-full flex items-center gap-2 p-3 mt-4 border border-gray-400 dark:border-white/15 rounded-md cursor-pointer hover:scale-103 transition-all duration-300">
        <Image src={assets.gallery_icon} style={'w-4.5 not-dark:invert'} alt={'community'}/>
        <div className="flex flex-col text-sm">
          <p>Comunity Images</p>
        </div>
      </div>

       {/* credits */}
      <div 
        onClick={()=> navigate('/credits') }
        className="w-full flex items-center gap-2 p-3 mt-4 border border-gray-400 dark:border-white/15 rounded-md cursor-pointer hover:scale-103 transition-all duration-300">
        <Image src={assets.diamond_icon} style={'w-4.5 dark:invert'} alt={'community'}/>
        <div className="flex flex-col text-sm dark:text-[#B1A6C0]">
          <p>Credits: {user?.credits}</p>
          <p className='text-sm text-gray-400 dark:text-[#B1A6C0]'>Purchase credits</p>
        </div> 
      </div>

      {/* Dark mode toggle */}
      <div 
        className="w-full flex items-center justify-between gap-2 p-3 mt-4 border border-gray-400 dark:border-white/15 rounded-md cursor-pointer hover:scale-103 transition-all duration-300">
        <div className="flex items-center gap-2 text-sm">
          <Image src={assets.theme_icon} 
            style="w-4 not-dark:invert" 
            alt="theme"
          />
          <p>Dark Mode</p>
          <label className='relative inline-flex cursor-pointer'>
            <input type="checkbox" className="sr-only peer" checked={theme === 'dark'} onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} />
            <div className="w-9 h-5 bg-gray-400 rounded-full peer-checked:bg-purple-700 transition-all duration-300 ease-in"/>
            <span className='absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-4'></span>
           
          </label>
        </div>
      </div>

      {/* User Account */}
        <div 
        onClick={()=> navigate('/community') }
        className="w-full flex items-center gap-3 p-3 mt-4 border border-gray-400 dark:border-white/15 rounded-md cursor-pointer group">
        <Image src={assets.user_icon} style={'w-4.5 not-dark:invert rounded-full '} alt={'user'}/>
        <div className="flex-1 flex items-center justify-between text-sm dark:text-primary truncate">
          <p>{user ? user.name : 'Login your account'}</p>
          {
            user && <Image src={assets.logout_icon} style={'h-5 cursor-pointer hidden not-dark:invert group-hover:block'} alt={'logout'}/>
          }
        </div>
      </div>
      
      <Image src={assets.close_icon} style={'absolute top-3 right-3 size-5 cursor-pointer not-dark:invert md:hidden'} alt={'close'}/>

    </div>
  );
};

export default Sidebar;