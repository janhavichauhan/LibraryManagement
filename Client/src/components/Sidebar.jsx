import React from 'react';
import { NavLink } from 'react-router-dom';
import { Library, Users, FileBarChart, LogOut, BookOpen } from 'lucide-react';

const Sidebar = () => {
  const navClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      isActive ? 'bg-primary text-white shadow-lg shadow-blue-200' : 'text-textSub hover:bg-gray-50'
    }`;

  return (
    <div className="w-64 h-screen bg-sidebar fixed left-0 top-0 border-r border-gray-100 flex flex-col p-6 z-10">
      <div className="flex items-center gap-2 mb-10 px-2">
        <div className="bg-primary p-2 rounded-lg">
          <BookOpen className="text-white w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-navy">BookBase</h1>
      </div>

      <nav className="flex flex-col gap-2 flex-1">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-4">Menu</p>
        <NavLink to="/" className={navClass}><Library size={20} /> Catalog</NavLink>
        <NavLink to="/members" className={navClass}><Users size={20} /> Members</NavLink>
        <NavLink to="/reports" className={navClass}><FileBarChart size={20} /> Reports</NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;