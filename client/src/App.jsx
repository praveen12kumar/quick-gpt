import './App.css';

import {Route,Routes} from 'react-router-dom';

import Chatbox from './components/organisms/Chatbox';
import {AppContextProvider} from './context/AppContextProvider';
import AppLayout from './layouts/AppLayout';
import Community from './pages/Community';
import Credits from './pages/Credits';
import NotFound from './pages/NotFound';
function App() {
  
  return (


    <AppContextProvider>
    <div className="dark:bg-gradient-to-b from-[#242124] to-[#000000] dark:text-white">
      <Routes>
        {/* Layout route wraps these pages */}
        <Route element={<AppLayout />}>
          <Route index element={<Chatbox />} />
          <Route path="credits" element={<Credits />} />
          <Route path="community" element={<Community />} />
        </Route>

        {/* 404 (optional) */}
        <Route path="*" element={<NotFound/>} />
      </Routes>
      
    </div>
    </AppContextProvider>
  );
}

export default App;
