import React from 'react';
import { User, Task, Role, TaskStatus } from '../types';
import { Shield, Star, Trophy, Mail } from 'lucide-react';

interface TeamProps {
  employees: User[];
  tasks: Task[];
  currentUser: User;
}

const Team: React.FC<TeamProps> = ({ employees, tasks, currentUser }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
        <Shield className="w-6 h-6" /> Team Roster
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map(employee => {
          const empTasks = tasks.filter(t => t.assignedToId === employee.id);
          const completedCount = empTasks.filter(t => t.status === TaskStatus.COMPLETED).length;
          
          return (
            <div key={employee.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100 overflow-hidden group">
              <div className="h-24 bg-gradient-to-r from-blue-500 to-blue-600 relative">
                <div className="absolute -bottom-10 left-6">
                   <div className="relative">
                     <img 
                       src={employee.avatar} 
                       alt={employee.name} 
                       className="w-20 h-20 rounded-full border-4 border-white shadow-md object-cover"
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
                     <h3 className="font-bold text-xl text-gray-800">{employee.name}</h3>
                     <p className="text-sm text-gray-500 flex items-center gap-1">
                       <Mail className="w-3 h-3" /> {employee.email}
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
                       <span className="text-gray-500">Missions Completed</span>
                       <span className="font-bold text-emerald-600">{completedCount}</span>
                    </div>
                    
                    {/* XP Progress Bar Mock */}
                    <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                       <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(employee.xp! % 1000) / 10}%` }}></div>
                    </div>
                    <p className="text-xs text-center text-gray-400 mt-1">
                       {1000 - (employee.xp! % 1000)} XP to next level
                    </p>
                 </div>

                 {currentUser.role === Role.MANAGER && employee.role !== Role.MANAGER && (
                    <button className="w-full mt-6 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-2 rounded-lg transition-colors border border-gray-200">
                      View Profile Details
                    </button>
                 )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Team;