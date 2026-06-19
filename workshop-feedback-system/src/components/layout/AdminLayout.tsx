import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-xl font-bold text-slate-800">Admin Portal</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin/dashboard" className="block px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Dashboard</Link>
          <Link to="/admin/create" className="block px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Create Form</Link>
        </nav>
        <div className="p-4 border-t border-slate-200">
          <p className="text-sm text-slate-500 mb-2 truncate">{user?.email}</p>
          <button onClick={logout} className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            Sign Out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
