import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  AlertTriangle, 
  PieChart, 
  Bell, 
  FileText, 
  Settings, 
  LogOut,
  Image
} from 'lucide-react';

const Sidebar = ({ closeMobileMenu }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Villagers', path: '/villagers', icon: <Users size={20} /> },
    { name: 'Surveys', path: '/surveys', icon: <ClipboardList size={20} /> },
    { name: 'Complaints', path: '/complaints', icon: <AlertTriangle size={20} /> },
    { name: 'Problem Analysis', path: '/analysis', icon: <PieChart size={20} /> },
    { name: 'Announcements', path: '/announcements', icon: <Bell size={20} /> },
    { name: 'Gallery', path: '/gallery', icon: <Image size={20} /> },
    { name: 'Reports', path: '/reports', icon: <FileText size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="bg-primary-900 text-white w-64 min-h-screen flex flex-col">
      <div className="p-4 flex items-center justify-center border-b border-primary-700">
        <h1 className="text-xl font-bold tracking-wider">SVMS</h1>
      </div>
      
      <nav className="flex-1 mt-6">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-md transition-colors ${
                    isActive ? 'bg-primary-700 text-white' : 'text-primary-100 hover:bg-primary-800'
                  }`
                }
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-primary-700">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-primary-100 hover:text-white hover:bg-primary-800 rounded-md transition-colors"
        >
          <LogOut size={20} className="mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
