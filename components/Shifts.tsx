import React, { useState } from 'react';
import { Shift, User, Role } from '../types';
import { Calendar, FileText, Upload, Download, Eye } from 'lucide-react';

interface ShiftsProps {
  shifts: Shift[];
  currentUser: User;
  onUploadShift: (file: File) => void;
}

const Shifts: React.FC<ShiftsProps> = ({ shifts, currentUser, onUploadShift }) => {
  const isManager = currentUser.role === Role.MANAGER;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadShift(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
          <Calendar className="w-6 h-6" /> Shift Schedule
        </h2>
        {isManager && (
          <div className="relative">
            <input 
              type="file" 
              id="shift-upload" 
              className="hidden" 
              onChange={handleFileChange}
              accept=".pdf,.xlsx,.xls,image/*"
            />
            <label 
              htmlFor="shift-upload" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-all cursor-pointer font-medium"
            >
              <Upload className="w-4 h-4" /> Upload New Schedule
            </label>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {shifts.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
             <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
             <p>No shift schedules uploaded yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {shifts.map(shift => (
              <div key={shift.id} className="p-6 hover:bg-blue-50/30 transition-colors flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="bg-red-50 p-3 rounded-lg text-red-500">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{shift.title}</h3>
                    <p className="text-sm text-gray-500">Uploaded on {shift.date}</p>
                    <p className="text-xs text-gray-400 mt-1">{shift.fileName}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                   <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View">
                     <Eye className="w-5 h-5" />
                   </button>
                   <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Download">
                     <Download className="w-5 h-5" />
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Visual Placeholder for Schedule Preview */}
      <div className="bg-gray-100 rounded-xl p-8 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 min-h-[300px]">
         <img src="https://picsum.photos/800/400?grayscale&blur=2" className="opacity-20 rounded-lg mb-4" alt="Schedule Placeholder"/>
         <p>Select a schedule above to preview</p>
      </div>
    </div>
  );
};

export default Shifts;