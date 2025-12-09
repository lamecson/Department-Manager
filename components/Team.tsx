import React, { useState } from 'react';
import { User, Task, Role, TaskStatus, Note } from '../types';
import { Shield, Star, Trophy, Lock, ShieldCheck, History, BrainCircuit, Loader2, Save, X, MessageSquare, ClipboardList, Edit2, Check } from 'lucide-react';
import { generateFeedbackAnalysis } from '../services/geminiService';

interface TeamProps {
  employees: User[];
  tasks: Task[];
  currentUser: User;
  onUpdateUser: (user: User) => void;
}

const Team: React.FC<TeamProps> = ({ employees, tasks, currentUser, onUpdateUser }) => {
  const [editingUser, setEditingUser] = useState<User | null>(null); // For password
  const [selectedUser, setSelectedUser] = useState<User | null>(null); // For Profile View
  const [newPassword, setNewPassword] = useState('');
  
  // Evaluation State
  const [noteInput, setNoteInput] = useState('');
  const [editingNoteIndex, setEditingNoteIndex] = useState<number | null>(null);
  const [editingNoteText, setEditingNoteText] = useState('');

  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser && newPassword) {
      onUpdateUser({ ...editingUser, password: newPassword });
      setEditingUser(null);
      setNewPassword('');
      alert(`Password for ${editingUser.name} has been updated by ${currentUser.name}.`);
    }
  };

  const handleAddNote = () => {
    if (selectedUser && noteInput.trim()) {
       const newNote: Note = {
         id: Math.random().toString(36).substr(2, 9),
         text: noteInput,
         author: currentUser.name,
         date: new Date().toLocaleDateString()
       };

       // Add new note to the end of array
       const updatedNotes = [...(selectedUser.privateNotes || []), newNote];
       onUpdateUser({ ...selectedUser, privateNotes: updatedNotes });
       setNoteInput('');
    }
  };

  const startEditingNote = (index: number, text: string) => {
    setEditingNoteIndex(index);
    setEditingNoteText(text);
  };

  const saveEditedNote = () => {
    if (selectedUser && editingNoteIndex !== null) {
      const updatedNotes = [...(selectedUser.privateNotes || [])];
      
      // Update specific note
      updatedNotes[editingNoteIndex] = {
        ...updatedNotes[editingNoteIndex],
        text: editingNoteText,
        lastEditedBy: currentUser.name
      };

      onUpdateUser({ ...selectedUser, privateNotes: updatedNotes });
      setEditingNoteIndex(null);
      setEditingNoteText('');
    }
  };

  const handleAnalyzeFeedback = async () => {
    if (!selectedUser) return;
    setIsAnalyzing(true);
    const userTasks = tasks.filter(t => t.assignedToId === selectedUser.id);
    const feedback = await generateFeedbackAnalysis(selectedUser.name, selectedUser.privateNotes || [], userTasks);
    setAiAnalysis(feedback);
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
        <Shield className="w-6 h-6" /> Team Roster
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {employees.map(employee => {
          const empTasks = tasks.filter(t => t.assignedToId === employee.id);
          const completedCount = empTasks.filter(t => t.status === TaskStatus.COMPLETED).length;
          
          return (
            <div 
              key={employee.id} 
              onClick={() => currentUser.role === Role.MANAGER ? setSelectedUser(employee) : null}
              className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 overflow-hidden group ${currentUser.role === Role.MANAGER ? 'cursor-pointer active:scale-[0.98]' : ''}`}
            >
              <div className="h-24 bg-gradient-to-r from-blue-500 to-blue-600 relative">
                <div className="absolute -bottom-10 left-6">
                   <div className="relative">
                     <img 
                       src={employee.avatar} 
                       alt={employee.name} 
                       className="w-20 h-20 rounded-full border-4 border-white shadow-md object-cover bg-white"
                     />
                     {employee.role === Role.MANAGER && (
                       <div className="absolute -top-2 -right-2 bg-yellow-400 p-1 rounded-full shadow-sm text-yellow-900">
                         <Star className="w-4 h-4 fill-current" />
                       </div>
                     )}
                   </div>
                </div>
              </div>
              
              <div className="pt-12 px-6 pb-6">
                 <div className="flex justify-between items-start">
                   <div>
                     <h3 className="font-bold text-lg text-gray-800 truncate max-w-[120px]">{employee.name}</h3>
                     <p className="text-sm text-gray-500 font-mono text-xs mt-1 bg-gray-100 px-2 py-0.5 rounded inline-block">
                       {employee.username}
                     </p>
                   </div>
                   <div className="text-right">
                      <span className="block text-xs font-bold text-gray-400 uppercase">Level</span>
                      <span className="block text-2xl font-bold text-blue-600">{employee.level}</span>
                   </div>
                 </div>

                 <div className="mt-6 space-y-3">
                    <div className="flex justify-between text-sm">
                       <span className="text-gray-500">Total XP</span>
                       <span className="font-bold text-gray-800">{employee.xp}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                       <span className="text-gray-500">Missions Done</span>
                       <span className="font-bold text-emerald-600">{completedCount}</span>
                    </div>
                    
                    {/* XP Progress Bar Mock */}
                    <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                       <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(employee.xp! % 1000) / 10}%` }}></div>
                    </div>
                 </div>

                 {currentUser.role === Role.MANAGER && (
                   <div className="mt-4 flex gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingUser(employee); }}
                        className="flex-1 bg-gray-50 hover:bg-red-50 text-gray-500 hover:text-red-500 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 border border-transparent hover:border-red-200 transition-all"
                      >
                        <Lock className="w-3 h-3" /> Access
                      </button>
                      <button 
                         className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-blue-100 transition-all"
                      >
                        <ShieldCheck className="w-3 h-3" /> Review
                      </button>
                   </div>
                 )}
              </div>
            </div>
          );
        })}
      </div>

      {/* --- Full Profile Modal (Manager View) --- */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] md:h-[85vh] flex flex-col overflow-hidden animate-slideUp">
             {/* Header */}
             <div className="p-4 md:p-6 bg-slate-50 border-b border-gray-200 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                  <img src={selectedUser.avatar} className="w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-white shadow-sm bg-white" alt="Avatar"/>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800">{selectedUser.name}</h2>
                    <p className="text-gray-500 text-xs md:text-sm">Employee Profile</p>
                  </div>
                </div>
                <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-gray-200 rounded-full">
                  <X className="w-6 h-6 text-gray-500" />
                </button>
             </div>

             <div className="flex-1 overflow-y-auto flex flex-col md:flex-row">
                {/* Left: Task History */}
                <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col shrink-0 h-1/2 md:h-auto">
                   <div className="p-4 bg-gray-50 font-bold text-gray-700 flex items-center gap-2 border-b border-gray-100 sticky top-0 z-10">
                     <History className="w-5 h-5 text-blue-600" /> Mission History
                   </div>
                   <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                     {tasks.filter(t => t.assignedToId === selectedUser.id).length === 0 ? (
                       <p className="text-gray-400 text-center mt-10">No task history available.</p>
                     ) : (
                       <div className="space-y-3">
                          {tasks.filter(t => t.assignedToId === selectedUser.id).map(task => (
                            <div key={task.id} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex justify-between items-center">
                               <div>
                                 <p className="font-semibold text-gray-800 text-sm">{task.title}</p>
                                 <p className="text-xs text-gray-400">Due: {task.dueDate}</p>
                                 <p className="text-xs text-blue-400 mt-0.5">By: {task.assignedBy || 'Manager'}</p>
                               </div>
                               <div className="text-right">
                                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                    task.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 
                                    task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                  }`}>
                                    {task.status}
                                  </span>
                                  {task.managerVerified && (
                                    <div className="mt-1 flex justify-end">
                                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                    </div>
                                  )}
                               </div>
                            </div>
                          ))}
                       </div>
                     )}
                   </div>
                </div>

                {/* Right: Coaching & Notes */}
                <div className="flex-1 flex flex-col bg-slate-50 h-1/2 md:h-auto">
                   <div className="p-4 bg-white border-b border-gray-200 font-bold text-gray-700 flex items-center gap-2 sticky top-0 z-10">
                     <ClipboardList className="w-5 h-5 text-purple-600" /> Coaching Journal
                   </div>
                   
                   <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
                      {/* Note Input */}
                      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Add Private Observation</label>
                        <div className="mb-2 text-xs text-blue-500 font-medium">Writing as: {currentUser.name}</div>
                        <textarea 
                          className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-purple-200 outline-none resize-none"
                          rows={3}
                          placeholder="Log good performance or areas for improvement..."
                          value={noteInput}
                          onChange={e => setNoteInput(e.target.value)}
                        />
                        <div className="flex justify-end mt-2">
                          <button 
                            onClick={handleAddNote}
                            disabled={!noteInput.trim()}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 disabled:opacity-50 w-full md:w-auto justify-center"
                          >
                            <Save className="w-4 h-4" /> Save Note
                          </button>
                        </div>
                      </div>

                      {/* Notes List */}
                      {selectedUser.privateNotes && selectedUser.privateNotes.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-gray-400 uppercase">Previous Notes (History Log)</h4>
                          {[...selectedUser.privateNotes].reverse().map((note, idx) => {
                             const realIndex = selectedUser.privateNotes!.length - 1 - idx;
                             
                             return (
                            <div key={note.id || idx} className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-sm text-gray-700 relative group">
                              {editingNoteIndex === realIndex ? (
                                <div className="space-y-2">
                                  <div className="text-xs text-blue-600 mb-1">Editing as: {currentUser.name}</div>
                                  <textarea 
                                    value={editingNoteText}
                                    onChange={(e) => setEditingNoteText(e.target.value)}
                                    className="w-full p-2 text-sm border border-yellow-200 rounded bg-white"
                                    rows={2}
                                  />
                                  <div className="flex justify-end gap-2">
                                    <button 
                                      onClick={() => setEditingNoteIndex(null)}
                                      className="text-gray-500 text-xs hover:bg-gray-100 px-2 py-1 rounded"
                                    >
                                      Cancel
                                    </button>
                                    <button 
                                      onClick={saveEditedNote}
                                      className="bg-emerald-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1"
                                    >
                                      <Check className="w-3 h-3" /> Save
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="flex justify-between items-start mb-1">
                                     <span className="font-bold text-xs text-yellow-800">{note.author}</span>
                                     <span className="text-[10px] text-gray-400">{note.date}</span>
                                  </div>
                                  <p className="italic mb-1">"{note.text}"</p>
                                  {note.lastEditedBy && (
                                     <div className="text-[9px] text-gray-400 text-right">Edited by {note.lastEditedBy}</div>
                                  )}
                                  
                                  <button 
                                    onClick={() => startEditingNote(realIndex, note.text)}
                                    className="absolute top-2 right-2 text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Edit Note"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                </>
                              )}
                            </div>
                          )})}
                        </div>
                      )}

                      {/* AI Generator */}
                      <div className="bg-gradient-to-br from-indigo-50 to-white p-4 rounded-xl border border-indigo-100">
                         <div className="flex justify-between items-center mb-3">
                           <h4 className="font-bold text-indigo-900 flex items-center gap-2">
                             <BrainCircuit className="w-5 h-5" /> 1:1 Feedback Generator
                           </h4>
                         </div>
                         <p className="text-xs text-indigo-600 mb-4">
                           Generate a professional feedback script based on task history and notes.
                         </p>
                         
                         {!aiAnalysis ? (
                           <button 
                             onClick={handleAnalyzeFeedback}
                             disabled={isAnalyzing}
                             className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-200"
                           >
                             {isAnalyzing ? <Loader2 className="animate-spin w-4 h-4"/> : <MessageSquare className="w-4 h-4"/>}
                             Generate Script
                           </button>
                         ) : (
                           <div className="animate-fadeIn">
                             <div className="bg-white p-4 rounded-lg border border-indigo-100 text-sm text-gray-700 whitespace-pre-line leading-relaxed shadow-inner">
                               {aiAnalysis}
                             </div>
                             <button 
                               onClick={() => setAiAnalysis(null)} 
                               className="text-xs text-indigo-500 underline mt-2 hover:text-indigo-700"
                             >
                               Reset Analysis
                             </button>
                           </div>
                         )}
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal (Small) */}
      {editingUser && !selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-slideUp">
             <h3 className="text-lg font-bold text-gray-800 mb-4">Reset Access for {editingUser.name}</h3>
             <form onSubmit={handlePasswordReset}>
               <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
               <input 
                 type="text" 
                 value={newPassword}
                 onChange={e => setNewPassword(e.target.value)}
                 className="w-full px-3 py-2 border border-gray-200 rounded-lg mb-4"
                 placeholder="Enter new password"
                 required
               />
               <div className="flex gap-2">
                 <button 
                   type="button" 
                   onClick={() => setEditingUser(null)} 
                   className="flex-1 py-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                 >
                   Cancel
                 </button>
                 <button 
                   type="submit"
                   className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                 >
                   Update
                 </button>
               </div>
             </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Team;