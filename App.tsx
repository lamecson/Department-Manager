import React, { useState, useEffect } from 'react';
import { User, Task, Shift, ViewState, Role } from './types';
import { MOCK_USERS, MOCK_TASKS, MOCK_SHIFTS, STANDARD_TASKS } from './constants';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Team from './components/Team';
import Tasks from './components/Tasks';
import Shifts from './components/Shifts';
import { LayoutDashboard, Users, CheckSquare, Calendar, LogOut, Menu, Key, Star } from 'lucide-react';

const App: React.FC = () => {
  // Global State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [shifts, setShifts] = useState<Shift[]>(MOCK_SHIFTS);
  const [standardTaskList, setStandardTaskList] = useState<string[]>(STANDARD_TASKS); // Persist custom tasks in state
  const [currentView, setCurrentView] = useState<ViewState>('TASKS');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // UI State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newSelfPassword, setNewSelfPassword] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);

  // Handlers
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    // Managers default to Dashboard, Employees to Tasks
    setCurrentView(user.role === Role.MANAGER ? 'DASHBOARD' : 'TASKS');
    setShowWelcome(true);
    setTimeout(() => setShowWelcome(false), 4000); // Auto hide after 4s
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  const handleChangeOwnPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser && newSelfPassword) {
      handleUpdateUser({ ...currentUser, password: newSelfPassword });
      setIsPasswordModalOpen(false);
      setNewSelfPassword('');
      alert('Your password has been changed successfully.');
    }
  };

  const handleAddTask = (newTask: Omit<Task, 'id'>) => {
    const task: Task = {
      ...newTask,
      id: Math.random().toString(36).substr(2, 9),
    };
    setTasks([...tasks, task]);
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(tasks.filter(t => t.id !== taskId));
    }
  };

  const handleAddStandardTask = (newTitle: string) => {
    setStandardTaskList(prev => {
      if (!prev.includes(newTitle)) {
        return [...prev, newTitle];
      }
      return prev;
    });
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    
    // Add XP if completed
    if (updatedTask.status === 'COMPLETED' && currentUser?.role === Role.EMPLOYEE) {
       const oldTask = tasks.find(t => t.id === updatedTask.id);
       if(oldTask && oldTask.status !== 'COMPLETED') {
         // Simulate XP Gain
         const updatedUser = { ...currentUser, xp: (currentUser.xp || 0) + updatedTask.xpReward };
         setCurrentUser(updatedUser);
         setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
       }
    }
  };

  const handleUploadShift = (file: File) => {
    const newShift: Shift = {
      id: Math.random().toString(36).substr(2, 9),
      title: `Schedule ${new Date().toLocaleDateString()}`,
      date: new Date().toLocaleDateString(),
      fileName: file.name,
      fileUrl: '#',
      uploadedBy: currentUser!.id
    };
    setShifts([newShift, ...shifts]);
  };

  // If not authenticated, show Auth screen
  if (!currentUser) {
    return <Auth users={users} onLogin={handleLogin} onSignup={(u) => {
      setUsers([...users, u]);
      handleLogin(u);
    }} />;
  }

  // Helper to render view
  const renderView = () => {
    switch (currentView) {
      case 'DASHBOARD':
        return <Dashboard tasks={tasks} employees={users} />;
      case 'TEAM':
        return <Team employees={users} tasks={tasks} currentUser={currentUser} onUpdateUser={handleUpdateUser} />;
      case 'TASKS':
        return (
          <Tasks 
            tasks={tasks} 
            employees={users} 
            currentUser={currentUser} 
            standardTaskList={standardTaskList}
            onUpdateTask={handleUpdateTask} 
            onAddTask={handleAddTask} 
            onDeleteTask={handleDeleteTask}
            onAddStandardTask={handleAddStandardTask}
          />
        );
      case 'SHIFTS':
        return <Shifts shifts={shifts} currentUser={currentUser} onUploadShift={handleUploadShift} />;
      default:
        return (
          <Tasks 
            tasks={tasks} 
            employees={users} 
            currentUser={currentUser} 
            standardTaskList={standardTaskList}
            onUpdateTask={handleUpdateTask} 
            onAddTask={handleAddTask} 
            onDeleteTask={handleDeleteTask}
            onAddStandardTask={handleAddStandardTask}
          />
        );
    }
  };

  const NavItem = ({ view, icon: Icon, label }: { view: ViewState, icon: any, label: string }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium mb-1 ${
        currentView === view 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-300' 
          : 'text-slate-500 hover:bg-slate-100'
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );

  return (
    <div className="flex h-screen bg-[#f0f4f8] overflow-hidden">
      {/* Welcome Popup */}
      {showWelcome && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 animate-bounce-in">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 border-2 border-white/20">
            <div className="bg-white/20 p-2 rounded-full">
              <Star className="w-6 h-6 fill-current text-yellow-300" />
            </div>
            <div>
              <p className="font-bold text-lg">Do the basic with excellence</p>
              <p className="text-sm text-blue-100">I trust you</p>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside 
        className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white h-full border-r border-slate-200 shadow-xl z-20 transition-all duration-300 flex flex-col`}
      >
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
           <div className="bg-blue-600 text-white p-2 rounded-lg font-bold text-xl shadow-md">TM</div>
           {isSidebarOpen && <h1 className="font-bold text-xl text-slate-800 tracking-tight">TaskMaster</h1>}
        </div>

        <nav className="flex-1 p-4">
          {currentUser.role === Role.MANAGER && (
            <NavItem view="DASHBOARD" icon={LayoutDashboard} label={isSidebarOpen ? "Command Center" : ""} />
          )}
          <NavItem view="TEAM" icon={Users} label={isSidebarOpen ? "Team Roster" : ""} />
          <NavItem view="TASKS" icon={CheckSquare} label={isSidebarOpen ? "Missions" : ""} />
          <NavItem view="SHIFTS" icon={Calendar} label={isSidebarOpen ? "Shift Schedule" : ""} />
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <img src={currentUser.avatar} className="w-8 h-8 rounded-full border border-white shadow-sm" alt="User" />
            {isSidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-700 truncate">{currentUser.name}</p>
                <button 
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="text-xs text-blue-500 hover:text-blue-700 font-medium flex items-center gap-1 mt-0.5"
                >
                  <Key className="w-3 h-3" /> Change Password
                </button>
              </div>
            )}
          </div>
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-500 hover:bg-red-50 transition-all font-medium text-sm ${!isSidebarOpen && 'justify-center'}`}
          >
            <LogOut className="w-4 h-4" />
            {isSidebarOpen && "Sign Out"}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur border-b border-slate-200 flex items-center justify-between px-6 z-10 sticky top-0">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
                <p className="text-xs text-slate-400 font-medium">CURRENT ROLE</p>
                <p className="text-sm font-bold text-blue-900">{currentUser.role}</p>
             </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto h-full">
            {renderView()}
          </div>
        </div>

        {/* Change Self Password Modal */}
        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Change Password</h3>
              <form onSubmit={handleChangeOwnPassword}>
                <input 
                   type="password" 
                   value={newSelfPassword}
                   onChange={e => setNewSelfPassword(e.target.value)}
                   className="w-full px-3 py-2 border border-gray-200 rounded-lg mb-4"
                   placeholder="New Password"
                   required
                />
                <div className="flex gap-2">
                   <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="flex-1 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
                   <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;