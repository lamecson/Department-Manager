import React, { useState } from 'react';
import { Task, User, Role, TaskStatus } from '../types';
import { getTaskSuggestions } from '../services/geminiService';
import { Plus, CheckCircle, Clock, Circle, User as UserIcon, Calendar, Info, X, BrainCircuit, Loader2, ListChecks, Filter, Edit2, Save, ShieldCheck, LayoutGrid, List, Trash2, UserCheck } from 'lucide-react';

interface TasksProps {
  tasks: Task[];
  employees: User[];
  currentUser: User;
  standardTaskList: string[]; // Dynamic standard list
  onUpdateTask: (task: Task) => void;
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onAddStandardTask: (newTitle: string) => void; // For persisting custom tasks
  onDeleteTask: (taskId: string) => void;
}

const Tasks: React.FC<TasksProps> = ({ tasks, employees, currentUser, standardTaskList, onUpdateTask, onAddTask, onAddStandardTask, onDeleteTask }) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const isManager = currentUser.role === Role.MANAGER;

  // View Mode for Manager
  const [viewMode, setViewMode] = useState<'BOARD' | 'LIST'>('BOARD');

  // Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Task>>({});

  // Filters State
  const [filterEmployee, setFilterEmployee] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]); // Default to today

  // Daily Planner State
  const [plannerAssignee, setPlannerAssignee] = useState(employees.filter(e => e.role !== Role.MANAGER)[0]?.id || '');
  const [selectedStandardTasks, setSelectedStandardTasks] = useState<string[]>([]);
  const [customTaskTitle, setCustomTaskTitle] = useState('');
  const [customTaskXP, setCustomTaskXP] = useState(50);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleStatusChange = (task: Task, newStatus: TaskStatus) => {
    onUpdateTask({ ...task, status: newStatus });
  };

  const handleTaskUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTask && isEditing) {
      onUpdateTask({ ...selectedTask, ...editForm });
      setSelectedTask({ ...selectedTask, ...editForm });
      setIsEditing(false);
    }
  };

  const handleBulkCreate = (e: React.FormEvent) => {
    e.preventDefault();
    
    const assigneeName = employees.find(e => e.id === plannerAssignee)?.name;
    const assignedBy = currentUser.name;

    // Create Standard Tasks
    if (selectedStandardTasks.length > 0) {
      selectedStandardTasks.forEach(title => {
        onAddTask({
          title: title.toUpperCase(),
          description: `Standard operational task assigned by ${assignedBy}.`,
          assignedToId: plannerAssignee,
          assignedBy: assignedBy,
          status: TaskStatus.TODO,
          dueDate: filterDate,
          imageUrl: `https://picsum.photos/600/400?random=${Math.floor(Math.random() * 1000)}`,
          instructions: 'Refer to department standard operating procedures.',
          xpReward: 50 // Default standard XP
        });
      });
    }

    // Create Custom Task if provided
    if (customTaskTitle.trim()) {
       const upperTitle = customTaskTitle.toUpperCase();
       
       // Persist to standard list if new
       if (!standardTaskList.includes(upperTitle)) {
         onAddStandardTask(upperTitle);
       }

       onAddTask({
          title: upperTitle,
          description: `Custom assignment by ${assignedBy}.`,
          assignedToId: plannerAssignee,
          assignedBy: assignedBy,
          status: TaskStatus.TODO,
          dueDate: filterDate,
          imageUrl: `https://picsum.photos/600/400?random=${Math.floor(Math.random() * 1000)}`,
          instructions: 'Please follow manager instructions.',
          xpReward: customTaskXP
       });
    }

    setIsCreateModalOpen(false);
    setSelectedStandardTasks([]);
    setCustomTaskTitle('');
    setCustomTaskXP(50);
  };

  const handleAiSuggest = async () => {
    setIsAnalyzing(true);
    const employee = employees.find(e => e.id === plannerAssignee);
    if (employee) {
      const empTasks = tasks.filter(t => t.assignedToId === employee.id);
      const suggestions = await getTaskSuggestions(employee.name, empTasks, standardTaskList);
      const newSelection = Array.from(new Set([...selectedStandardTasks, ...suggestions]));
      setSelectedStandardTasks(newSelection);
    }
    setIsAnalyzing(false);
  };

  const toggleTaskSelection = (taskTitle: string) => {
    if (selectedStandardTasks.includes(taskTitle)) {
      setSelectedStandardTasks(selectedStandardTasks.filter(t => t !== taskTitle));
    } else {
      setSelectedStandardTasks([...selectedStandardTasks, taskTitle]);
    }
  };

  // --- Filtering Logic ---
  let visibleTasks = tasks;

  if (isManager) {
    // Manager Filters
    if (filterEmployee !== 'ALL') {
      visibleTasks = visibleTasks.filter(t => t.assignedToId === filterEmployee);
    }
    if (filterStatus !== 'ALL') {
      visibleTasks = visibleTasks.filter(t => t.status === filterStatus);
    }
    // Optional Date Filter (Empty means all history)
    if (filterDate) {
      visibleTasks = visibleTasks.filter(t => t.dueDate === filterDate);
    }
  } else {
    // Employee View: Only see OWN tasks
    visibleTasks = visibleTasks.filter(t => t.assignedToId === currentUser.id);
    
    // Focus Mode: Show tasks due TODAY or overdue TODOs. Hide completed past tasks.
    const today = new Date().toISOString().split('T')[0];
    visibleTasks = visibleTasks.filter(t => {
      const isToday = t.dueDate === today;
      const isActive = t.status !== TaskStatus.COMPLETED;
      if (t.status === TaskStatus.COMPLETED && !isToday) return false;
      return true;
    });
  }

  const columns = [
    { id: TaskStatus.TODO, label: 'To Do', icon: Circle, color: 'text-gray-500', bg: 'bg-gray-100' },
    { id: TaskStatus.IN_PROGRESS, label: 'In Progress', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: TaskStatus.COMPLETED, label: 'Completed', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
            Mission Board
            {!isManager && <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">Today's Focus</span>}
          </h2>
        </div>
        
        {isManager && (
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
             <div className="flex items-center bg-gray-100 rounded-lg p-1 border border-gray-200">
                <button 
                  onClick={() => setViewMode('BOARD')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'BOARD' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('LIST')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'LIST' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <List className="w-4 h-4" />
                </button>
             </div>

             <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
               <Filter className="w-4 h-4 text-gray-400 ml-2" />
               <select 
                 className="bg-transparent text-sm text-gray-700 outline-none p-1"
                 value={filterEmployee}
                 onChange={(e) => setFilterEmployee(e.target.value)}
               >
                 <option value="ALL">All Team</option>
                 {employees.filter(e => e.role !== Role.MANAGER).map(e => (
                   <option key={e.id} value={e.id}>{e.name}</option>
                   ))}
               </select>
               <div className="w-px h-4 bg-gray-200 mx-1"></div>
               <select 
                 className="bg-transparent text-sm text-gray-700 outline-none p-1"
                 value={filterStatus}
                 onChange={(e) => setFilterStatus(e.target.value)}
               >
                 <option value="ALL">All Status</option>
                 <option value={TaskStatus.TODO}>To Do</option>
                 <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                 <option value={TaskStatus.COMPLETED}>Completed</option>
               </select>
               <div className="w-px h-4 bg-gray-200 mx-1"></div>
               <input 
                 type="date" 
                 value={filterDate}
                 onChange={(e) => setFilterDate(e.target.value)}
                 className="text-sm text-gray-700 outline-none bg-transparent p-1"
               />
             </div>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-all font-medium text-sm whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Assign Tasks
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {viewMode === 'BOARD' ? (
        // --- Kanban Board View ---
        <div className="flex-1 overflow-x-auto pb-4">
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
                  {visibleTasks.filter(t => t.status === col.id).length === 0 && (
                    <div className="text-center py-10 text-gray-400 text-sm italic">
                      No missions here.
                    </div>
                  )}
                  {visibleTasks.filter(t => t.status === col.id).map(task => (
                    <div 
                      key={task.id} 
                      onClick={() => {
                        setSelectedTask(task);
                        setIsEditing(false); // Reset edit mode on open
                      }}
                      className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group relative overflow-hidden ${task.managerVerified ? 'ring-1 ring-emerald-400' : ''}`}
                    >
                      {/* XP Badge */}
                      <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10">
                        {task.xpReward} XP
                      </div>
                      {task.managerVerified && (
                        <div className="absolute bottom-2 right-2 text-emerald-500">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                      )}

                      <h4 className="font-semibold text-gray-800 mb-1 pr-8 text-sm md:text-base">{task.title}</h4>
                      <p className="text-xs text-gray-400 mb-2 truncate">By: {task.assignedBy || 'Manager'}</p>
                      
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                         <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            {isManager && (
                               <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded flex items-center gap-1">
                                 <UserIcon className="w-3 h-3" />
                                 {employees.find(e => e.id === task.assignedToId)?.name.split(' ')[0]}
                               </span>
                            )}
                            <span className={`flex items-center gap-1 ${task.dueDate === new Date().toISOString().split('T')[0] ? 'text-amber-600 font-bold' : ''}`}>
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
      ) : (
        // --- List View (Management Mode) ---
        <div className="flex-1 overflow-hidden bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-bold text-gray-700">Task Management Registry</h3>
            <span className="text-xs text-gray-500">Edit XP, details, delete, and verify tasks in bulk.</span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 sticky top-0 z-10 text-gray-600">
                <tr>
                  <th className="p-4 font-semibold">Title & Detail</th>
                  <th className="p-4 font-semibold">Assignee</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Due Date</th>
                  <th className="p-4 font-semibold">XP Reward</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visibleTasks.map(task => (
                  <tr key={task.id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="p-4 max-w-xs">
                      <div className="font-bold text-gray-800">{task.title}</div>
                      <div className="text-gray-500 text-xs">By {task.assignedBy || 'Unknown'}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <img 
                          src={employees.find(e => e.id === task.assignedToId)?.avatar} 
                          className="w-6 h-6 rounded-full bg-gray-200"
                          alt="" 
                        />
                        <span>{employees.find(e => e.id === task.assignedToId)?.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold 
                        ${task.status === TaskStatus.TODO ? 'bg-gray-100 text-gray-600' : 
                          task.status === TaskStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500">{task.dueDate}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <input 
                          type="number" 
                          value={task.xpReward}
                          onChange={(e) => onUpdateTask({...task, xpReward: parseInt(e.target.value) || 0})}
                          className="w-16 border border-gray-200 rounded px-2 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                        <span className="text-xs text-gray-400">XP</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                       <div className="flex items-center justify-end gap-2">
                         <button 
                           onClick={() => { setSelectedTask(task); setIsEditing(true); setEditForm(task); }}
                           className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                           title="Edit Details"
                         >
                           <Edit2 className="w-4 h-4" />
                         </button>
                         <button 
                           onClick={() => onDeleteTask(task.id)}
                           className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                           title="Delete Task"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fadeIn">
            {/* Modal Header Image */}
            <div className="relative h-48 bg-gray-100 group">
               <img 
                 src={isEditing && editForm.imageUrl ? editForm.imageUrl : selectedTask.imageUrl} 
                 alt={selectedTask.title} 
                 className="w-full h-full object-cover"
               />
               <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
               
               <button 
                 onClick={() => setSelectedTask(null)}
                 className="absolute top-4 right-4 bg-white/90 p-2 rounded-full hover:bg-white text-gray-800 shadow-lg z-10"
               >
                 <X className="w-5 h-5" />
               </button>

               {/* Edit Button for Managers */}
               {isManager && !isEditing && (
                 <button 
                   onClick={() => {
                     setIsEditing(true);
                     setEditForm(selectedTask);
                   }}
                   className="absolute top-4 right-16 bg-white/90 p-2 rounded-full hover:bg-blue-50 text-blue-600 shadow-lg z-10"
                 >
                   <Edit2 className="w-5 h-5" />
                 </button>
               )}
            </div>

            <div className="p-6">
              {isEditing ? (
                // --- Edit Mode ---
                <form onSubmit={handleTaskUpdate} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase">Title</label>
                    <input 
                      className="w-full text-xl font-bold border-b-2 border-blue-200 focus:border-blue-500 outline-none py-1 uppercase"
                      value={editForm.title}
                      onChange={e => setEditForm({...editForm, title: e.target.value.toUpperCase()})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase mt-2">XP Reward</label>
                       <input 
                         type="number"
                         className="w-full border p-2 rounded-lg text-sm"
                         value={editForm.xpReward}
                         onChange={e => setEditForm({...editForm, xpReward: parseInt(e.target.value) || 0})}
                       />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase mt-2">Status</label>
                       <select 
                         className="w-full border p-2 rounded-lg text-sm"
                         value={editForm.status}
                         onChange={e => setEditForm({...editForm, status: e.target.value as TaskStatus})}
                       >
                         <option value={TaskStatus.TODO}>Todo</option>
                         <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                         <option value={TaskStatus.COMPLETED}>Completed</option>
                       </select>
                     </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mt-2">Description</label>
                    <textarea 
                      className="w-full border p-2 rounded-lg text-sm"
                      value={editForm.description}
                      onChange={e => setEditForm({...editForm, description: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mt-2">Instructions</label>
                    <textarea 
                      className="w-full border p-2 rounded-lg text-sm h-24"
                      value={editForm.instructions}
                      onChange={e => setEditForm({...editForm, instructions: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mt-2">Image URL</label>
                    <input 
                      className="w-full border p-2 rounded-lg text-sm"
                      value={editForm.imageUrl}
                      onChange={e => setEditForm({...editForm, imageUrl: e.target.value})}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-500">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2">
                      <Save className="w-4 h-4" /> Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                // --- View Mode ---
                <>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedTask.title}</h2>
                      <div className="flex flex-col gap-1 mt-1">
                        <div className="flex items-center gap-2">
                           <span className={`px-2 py-0.5 rounded-md text-xs font-bold 
                             ${selectedTask.status === TaskStatus.TODO ? 'bg-gray-100 text-gray-600' : 
                               selectedTask.status === TaskStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                               {selectedTask.status}
                           </span>
                           {selectedTask.managerVerified && (
                              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> Verified
                              </span>
                           )}
                        </div>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                           <UserCheck className="w-3 h-3" />
                           Assigned by: <span className="font-bold">{selectedTask.assignedBy || 'Manager'}</span>
                        </span>
                      </div>
                    </div>
                    <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-lg font-bold flex flex-col items-center border border-yellow-200 shadow-sm">
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
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">Standard Instructions</h3>
                      <div className="text-gray-600 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                          {selectedTask.instructions}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      
                      <div className="flex items-center gap-2">
                         {isManager && (
                           <button 
                             onClick={() => { onDeleteTask(selectedTask.id); setSelectedTask(null); }}
                             className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                           >
                             <Trash2 className="w-4 h-4" /> Delete Task
                           </button>
                         )}
                         {isManager && selectedTask.status === TaskStatus.COMPLETED && (
                           <button 
                             onClick={() => {
                               onUpdateTask({ ...selectedTask, managerVerified: !selectedTask.managerVerified });
                               setSelectedTask({ ...selectedTask, managerVerified: !selectedTask.managerVerified });
                             }}
                             className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${selectedTask.managerVerified ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'}`}
                           >
                             {selectedTask.managerVerified ? <><X className="w-4 h-4"/> Revoke Verification</> : <><ShieldCheck className="w-4 h-4"/> Verify Excellence</>}
                           </button>
                         )}
                      </div>

                      <div className="flex gap-3">
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
                              setSelectedTask(null);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-200 transition-all"
                          >
                            Start Mission
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Daily Planner Modal (Manager Only) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col animate-slideUp overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <ListChecks className="w-6 h-6 text-blue-600"/> Daily Mission Planner
                </h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)}><X className="w-5 h-5 text-gray-400 hover:text-gray-600"/></button>
            </div>
            
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
               {/* Left Panel */}
               <div className="w-full md:w-1/3 border-r border-gray-100 p-6 bg-white flex flex-col gap-6 overflow-y-auto">
                 <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">1. Select Team Member</label>
                   <select 
                     value={plannerAssignee} 
                     onChange={e => {
                       setPlannerAssignee(e.target.value);
                       setSelectedStandardTasks([]); 
                     }}
                     className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg"
                   >
                     {employees.filter(e => e.role !== Role.MANAGER).map(e => (
                       <option key={e.id} value={e.id}>{e.name}</option>
                     ))}
                   </select>
                 </div>
                 
                 <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                   <h4 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                     <BrainCircuit className="w-4 h-4"/> AI Advisor
                   </h4>
                   <button 
                     onClick={handleAiSuggest}
                     disabled={isAnalyzing}
                     className="w-full bg-white text-blue-600 border border-blue-200 hover:bg-blue-600 hover:text-white font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-2"
                   >
                     {isAnalyzing ? <Loader2 className="animate-spin w-4 h-4"/> : <BrainCircuit className="w-4 h-4"/>}
                     Auto-Suggest Plan
                   </button>
                 </div>

                 {/* Custom Task Section */}
                 <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                    <h4 className="text-sm font-bold text-amber-900 mb-2 flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Custom Mission
                    </h4>
                    <input 
                      type="text"
                      placeholder="ENTER TITLE (WILL BE SAVED)"
                      className="w-full mb-2 px-3 py-2 border border-gray-200 rounded-lg text-sm uppercase"
                      value={customTaskTitle}
                      onChange={e => setCustomTaskTitle(e.target.value.toUpperCase())}
                    />
                    <div className="flex items-center gap-2">
                      <input 
                        type="number"
                        placeholder="XP"
                        className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        value={customTaskXP}
                        onChange={e => setCustomTaskXP(parseInt(e.target.value))}
                      />
                      <span className="text-xs text-amber-700">XP Reward</span>
                    </div>
                    <p className="text-[10px] text-amber-700/60 mt-2 leading-tight">
                      * New custom tasks will be added to the Standard List database automatically.
                    </p>
                 </div>

                 <div className="mt-auto pt-4">
                    <button 
                      onClick={handleBulkCreate}
                      disabled={selectedStandardTasks.length === 0 && !customTaskTitle.trim()}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl shadow-md transition-all"
                    >
                      Assign {selectedStandardTasks.length + (customTaskTitle.trim() ? 1 : 0)} Tasks by {currentUser.name}
                    </button>
                 </div>
               </div>

               {/* Right Panel */}
               <div className="flex-1 p-6 overflow-y-auto bg-gray-50 custom-scrollbar">
                 <label className="block text-sm font-bold text-gray-700 mb-4 sticky top-0 bg-gray-50 pb-2 z-10">
                   2. Select Standard Tasks
                 </label>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                   {standardTaskList.map((taskTitle, index) => (
                     <div 
                       key={index}
                       onClick={() => toggleTaskSelection(taskTitle)}
                       className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                         selectedStandardTasks.includes(taskTitle) 
                           ? 'bg-blue-600 border-blue-600 text-white shadow-md transform scale-[1.02]' 
                           : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                       }`}
                     >
                       <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                         selectedStandardTasks.includes(taskTitle) ? 'border-white' : 'border-gray-300'
                       }`}>
                         {selectedStandardTasks.includes(taskTitle) && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                       </div>
                       <span className="font-medium text-sm">{taskTitle}</span>
                     </div>
                   ))}
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;