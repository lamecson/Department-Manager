import React, { useState } from 'react';
import { Task, User, Role, TaskStatus } from '../types';
import { Plus, CheckCircle, Clock, Circle, User as UserIcon, Calendar, Info, X, Camera } from 'lucide-react';

interface TasksProps {
  tasks: Task[];
  employees: User[];
  currentUser: User;
  onUpdateTask: (task: Task) => void;
  onAddTask: (task: Omit<Task, 'id'>) => void;
}

const Tasks: React.FC<TasksProps> = ({ tasks, employees, currentUser, onUpdateTask, onAddTask }) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // New Task Form State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState(employees[0]?.id || '');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskXP, setNewTaskXP] = useState(50);

  const isManager = currentUser.role === Role.MANAGER;

  const handleStatusChange = (task: Task, newStatus: TaskStatus) => {
    onUpdateTask({ ...task, status: newStatus });
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTask({
      title: newTaskTitle,
      description: newTaskDesc,
      assignedToId: newTaskAssignee,
      status: TaskStatus.TODO,
      dueDate: newTaskDueDate || new Date().toISOString().split('T')[0],
      imageUrl: `https://picsum.photos/600/400?random=${Math.floor(Math.random() * 1000)}`,
      instructions: 'Standard operating procedure applies.',
      xpReward: newTaskXP
    });
    setIsCreateModalOpen(false);
    // Reset form
    setNewTaskTitle('');
    setNewTaskDesc('');
  };

  // Filter tasks: Employees see only theirs, Managers see all
  const visibleTasks = isManager 
    ? tasks 
    : tasks.filter(t => t.assignedToId === currentUser.id);

  const columns = [
    { id: TaskStatus.TODO, label: 'To Do', icon: Circle, color: 'text-gray-500', bg: 'bg-gray-100' },
    { id: TaskStatus.IN_PROGRESS, label: 'In Progress', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: TaskStatus.COMPLETED, label: 'Completed', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-900">Mission Board</h2>
        {isManager && (
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-all font-medium"
          >
            <Plus className="w-5 h-5" /> New Mission
          </button>
        )}
      </div>

      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-6 h-full min-w-[800px]">
          {columns.map(col => (
            <div key={col.id} className="flex-1 flex flex-col bg-gray-50/50 rounded-2xl border border-gray-200/60 p-4">
              <div className={`flex items-center gap-2 mb-4 p-2 rounded-lg ${col.bg}`}>
                <col.icon className={`w-5 h-5 ${col.color}`} />
                <h3 className={`font-bold ${col.color}`}>{col.label}</h3>
                <span className="ml-auto bg-white px-2 py-0.5 rounded-md text-xs font-bold text-gray-500 shadow-sm">
                  {visibleTasks.filter(t => t.status === col.id).length}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {visibleTasks.filter(t => t.status === col.id).map(task => (
                  <div 
                    key={task.id} 
                    onClick={() => setSelectedTask(task)}
                    className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group relative overflow-hidden"
                  >
                    {/* XP Badge */}
                    <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                      {task.xpReward} XP
                    </div>

                    <h4 className="font-semibold text-gray-800 mb-1 pr-6">{task.title}</h4>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">{task.description}</p>
                    
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                       <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          {isManager && (
                             <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded flex items-center gap-1">
                               <UserIcon className="w-3 h-3" />
                               {employees.find(e => e.id === task.assignedToId)?.name.split(' ')[0]}
                             </span>
                          )}
                          <span className="flex items-center gap-1">
                             <Calendar className="w-3 h-3" /> {task.dueDate}
                          </span>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="relative h-48 bg-gray-100">
               <img 
                 src={selectedTask.imageUrl} 
                 alt={selectedTask.title} 
                 className="w-full h-full object-cover"
               />
               <button 
                 onClick={() => setSelectedTask(null)}
                 className="absolute top-4 right-4 bg-white/90 p-2 rounded-full hover:bg-white text-gray-800 shadow-lg"
               >
                 <X className="w-5 h-5" />
               </button>
               <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold text-blue-800 shadow-sm flex items-center gap-1">
                 <Camera className="w-4 h-4" /> Visual Reference
               </div>
            </div>

            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                   <h2 className="text-2xl font-bold text-gray-900">{selectedTask.title}</h2>
                   <div className="flex items-center gap-2 mt-1">
                     <span className={`px-2 py-0.5 rounded-md text-xs font-bold 
                       ${selectedTask.status === TaskStatus.TODO ? 'bg-gray-100 text-gray-600' : 
                         selectedTask.status === TaskStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {selectedTask.status}
                     </span>
                     <span className="text-sm text-gray-500 flex items-center gap-1">
                       <Calendar className="w-4 h-4" /> Due: {selectedTask.dueDate}
                     </span>
                   </div>
                </div>
                <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-lg font-bold flex flex-col items-center border border-yellow-200">
                  <span className="text-xs uppercase tracking-wide">Reward</span>
                  <span className="text-lg">{selectedTask.xpReward} XP</span>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4" /> Description
                  </h3>
                  <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                    {selectedTask.description}
                  </p>
                </div>

                <div>
                   <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">Instructions</h3>
                   <div className="text-gray-600 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                      {selectedTask.instructions}
                   </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  {selectedTask.status !== TaskStatus.COMPLETED && (
                    <button 
                       onClick={() => {
                         handleStatusChange(selectedTask, TaskStatus.COMPLETED);
                         setSelectedTask(null);
                       }}
                       className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-emerald-200 transition-all flex items-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" /> Mark Completed
                    </button>
                  )}
                  {selectedTask.status === TaskStatus.TODO && (
                     <button 
                       onClick={() => {
                         handleStatusChange(selectedTask, TaskStatus.IN_PROGRESS);
                         setSelectedTask(null); // Close or keep open depending on preference, closing for cleaner UX
                       }}
                       className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-200 transition-all"
                     >
                       Start Mission
                     </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal (Manager Only) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slideUp">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Assign New Mission</h3>
              <button onClick={() => setIsCreateModalOpen(false)}><X className="w-5 h-5 text-gray-400 hover:text-gray-600"/></button>
            </div>
            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input 
                  type="text" required value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g., Clean Produce Section"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  required value={newTaskDesc} onChange={e => setNewTaskDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                   <select 
                     value={newTaskAssignee} onChange={e => setNewTaskAssignee(e.target.value)}
                     className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                   >
                     {employees.filter(e => e.role !== Role.MANAGER).map(e => (
                       <option key={e.id} value={e.id}>{e.name}</option>
                     ))}
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                   <input 
                     type="date" required value={newTaskDueDate} onChange={e => setNewTaskDueDate(e.target.value)}
                     className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                   />
                </div>
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">XP Reward</label>
                 <input 
                   type="number" min="10" max="1000" step="10" value={newTaskXP} onChange={e => setNewTaskXP(parseInt(e.target.value))}
                   className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                 />
              </div>
              
              <div className="pt-4">
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-md transition-all">
                  Create Mission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;