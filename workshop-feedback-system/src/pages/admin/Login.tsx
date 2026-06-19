import React from 'react';

const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 max-w-md w-full">
        <h1 className="text-2xl font-bold text-slate-800 text-center mb-6">Admin Login</h1>
        <p className="text-slate-500 text-center mb-4">Phase 1/2 functionality placeholder</p>
        <button className="w-full bg-indigo-600 text-white rounded-lg py-2 font-medium hover:bg-indigo-700 transition-colors">
          Login Placeholder
        </button>
      </div>
    </div>
  );
};

export default Login;
