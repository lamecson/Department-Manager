import React, { useState } from 'react';
import { User, Role } from '../types';
import { Lock, User as UserIcon, ArrowRight, ShieldCheck } from 'lucide-react';

interface AuthProps {
  users: User[];
  onLogin: (user: User) => void;
  onSignup: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ users, onLogin, onSignup }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>(Role.EMPLOYEE);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      // Find user by username
      const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
      
      if (user && user.password === password) {
        onLogin(user);
      } else {
        setError('Invalid credentials. Check username (name.zehrs) and password.');
      }
    } else {
      // Signup Logic (Simplified for demo)
      if (!name || !username || !password) {
        setError('Please fill all fields');
        return;
      }
      
      // Basic formatting check
      if (!username.endsWith('.zehrs')) {
         setError('Username must end with .zehrs');
         return;
      }

      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        username,
        email: `${username}@store.com`, // Auto-generate email mock
        password,
        role,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        level: 1,
        xp: 0
      };
      onSignup(newUser);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8] p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-1/4 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md p-6 md:p-8 relative z-10 border border-white">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-14 h-14 md:w-16 md:h-16 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-300 mb-4 transform rotate-3">
             <ShieldCheck className="text-white w-7 h-7 md:w-8 md:h-8" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">TaskMaster Pro</h1>
          <p className="text-gray-500 mt-2 text-sm md:text-base">Zehrs Retail Management</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
             <div className="relative">
               <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
               <input 
                 type="text" 
                 placeholder="Full Name (e.g. Jason)"
                 value={name}
                 onChange={e => setName(e.target.value)}
                 className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-sm md:text-base"
               />
             </div>
          )}
          
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Username (e.g. lamec.zehrs)"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-sm md:text-base"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="password" 
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-sm md:text-base"
            />
          </div>

          {!isLogin && (
            <div className="flex gap-4 p-1 bg-gray-100 rounded-xl">
               <button 
                 type="button"
                 onClick={() => setRole(Role.EMPLOYEE)}
                 className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${role === Role.EMPLOYEE ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
               >
                 Employee
               </button>
               <button 
                 type="button"
                 onClick={() => setRole(Role.MANAGER)}
                 className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${role === Role.MANAGER ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
               >
                 Manager
               </button>
            </div>
          )}

          {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg animate-pulse">{error}</p>}

          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 group active:scale-[0.98]"
          >
            {isLogin ? 'Sign In' : 'Create Account'}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-gray-500 hover:text-blue-600 text-sm font-medium transition-colors"
          >
            {isLogin ? "New Employee? Register Access" : "Back to Login"}
          </button>
        </div>
      </div>
      
      {/* Demo helper */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-gray-400 px-4">
         <p>Default Manager: lamec.zehrs | Default Password: grocery</p>
      </div>
    </div>
  );
};

export default Auth;