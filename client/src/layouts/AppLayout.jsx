
import { Outlet } from 'react-router-dom';

import Sidebar from '../components/molecules/Sidebar';

const AppLayout = () => {
  return (
    <div className="flex h-screen w-screen">
      <aside className="">
        <Sidebar />
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet /> {/* child routes render here */}
      </main>
    </div>
  );
};

export default AppLayout;