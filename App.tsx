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
  const [standardTaskList, setStandardTaskList] = useState<string[]>(STANDARD_TASKS);
  const [currentView, setCurrentView] = useState<ViewState>('TASKS');
  
  // Responsive Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // UI State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newSelfPassword, setNewSelfPassword] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        // Auto-close on mobile when resizing down
        setIsSidebarOpen(false);
      } else {
        // Auto-open on desktop when resizing up (optional, keeps UI consistent)
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handlers
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentView(user.role === Role.MANAGER ? 'DASHBOARD' : 'TASKS');
    setShowWelcome(true);
    setTimeout(() => setShowWelcome(false), 4000);
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
      onClick={() => {
        setCurrentView(view);
        if (isMobile) setIsSidebarOpen(false); // Close sidebar on mobile select
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium mb-1 ${
        currentView === view 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-300' 
          : 'text-slate-500 hover:bg-slate-100'
      }`}
    >
      <Icon className="w-5 h-5 min-w-[20px]" />
      {/* Show label if open (desktop) or if sidebar is open (mobile) */}
      {(isSidebarOpen || isMobile) && <span className="whitespace-nowrap">{label}</span>}
    </button>
  );

  return (
    <div className="flex h-screen bg-[#f0f4f8] overflow-hidden relative">
      {/* Welcome Popup */}
      {showWelcome && (
        <div className="fixed top-20 md:top-10 left-1/2 -translate-x-1/2 z-[60] animate-bounce-in w-[90%] md:w-auto">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border-2 border-white/20">
            <div className="bg-white/20 p-2 rounded-full shrink-0">
              <Star className="w-6 h-6 fill-current text-yellow-300" />
            </div>
            <div>
              <p className="font-bold text-lg leading-tight">Do the basic with excellence</p>
              <p className="text-sm text-blue-100">I trust you</p>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Backdrop */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-40 bg-white h-full border-r border-slate-200 shadow-xl transition-all duration-300 flex flex-col
          ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64 md:translate-x-0 md:w-20'}
          md:relative
        `}
      >
        <div className="p-6 flex items-center gap-3 border-b border-slate-100 h-20">
           <div className="bg-blue-600 text-white p-2 rounded-lg font-bold text-xl shadow-md shrink-0">TM</div>
           <div className={`transition-opacity duration-200 ${!isSidebarOpen && !isMobile ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
             <h1 className="font-bold text-xl text-slate-800 tracking-tight whitespace-nowrap">TaskMaster</h1>
           </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          {currentUser.role === Role.MANAGER && (
            <NavItem view="DASHBOARD" icon={LayoutDashboard} label="Command Center" />
          )}
          <NavItem view="TEAM" icon={Users} label="Team Roster" />
          <NavItem view="TASKS" icon={CheckSquare} label="Missions" />
          <NavItem view="SHIFTS" icon={Calendar} label="Shift Schedule" />
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <div className={`flex items-center gap-3 mb-4 px-2 ${!isSidebarOpen && !isMobile ? 'justify-center' : ''}`}>
            <img src={currentUser.avatar} className="w-8 h-8 rounded-full border border-white shadow-sm shrink-0" alt="User" />
            {(isSidebarOpen || isMobile) && (
              <div className="overflow-hidden min-w-0">
                <p className="text-sm font-bold text-slate-700 truncate">{currentUser.name}</p>
                <button 
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="text-xs text-blue-500 hover:text-blue-700 font-medium flex items-center gap-1 mt-0.5 whitespace-nowrap"
                >
                  <Key className="w-3 h-3" /> Change Password
                </button>
              </div>
            )}
          </div>
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-500 hover:bg-red-50 transition-all font-medium text-sm ${(!isSidebarOpen && !isMobile) && 'justify-center'}`}
            title="Sign Out"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {(isSidebarOpen || isMobile) && "Sign Out"}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur border-b border-slate-200 flex items-center justify-between px-4 md:px-6 z-10 sticky top-0 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-100">
              <Menu className="w-6 h-6" />
            </button>
            <span className="font-bold text-slate-700 md:hidden">{currentView.charAt(0) + currentView.slice(1).toLowerCase()}</span>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="text-right flex items-center gap-2">
                <div className="hidden sm:block">
                  <p className="text-[10px] md:text-xs text-slate-400 font-medium uppercase">Current Role</p>
                  <p className="text-xs md:text-sm font-bold text-blue-900">{currentUser.role}</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 sm:hidden font-bold">
                  {currentUser.role.charAt(0)}
                </div>
             </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto h-full">
            {renderView()}
          </div>
        </div>

        {/* Change Self Password Modal */}
        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 animate-slideUp">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Change Password</h3>
              <form onSubmit={handleChangeOwnPassword}>
                <input 
                   type="password" 
                   value={newSelfPassword}
                   onChange={e => setNewSelfPassword(e.target.value)}
                   className="w-full px-3 py-3 border border-gray-200 rounded-lg mb-4 text-base"
                   placeholder="New Password"
                   required
                />
                <div className="flex gap-2">
                   <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="flex-1 py-3 text-gray-500 hover:bg-gray-100 rounded-lg font-medium">Cancel</button>
                   <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Save</button>
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