import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Task, User, TaskStatus } from '../types';
import { getDashboardInsights } from '../services/geminiService';
import { BrainCircuit, Loader2, TrendingUp, AlertCircle } from 'lucide-react';

interface DashboardProps {
  tasks: Task[];
  employees: User[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b']; // Blue, Green, Amber

const Dashboard: React.FC<DashboardProps> = ({ tasks, employees }) => {
  const [insights, setInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Prepare Chart Data
  const statusData = [
    { name: 'To Do', value: tasks.filter(t => t.status === TaskStatus.TODO).length },
    { name: 'In Progress', value: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length },
    { name: 'Completed', value: tasks.filter(t => t.status === TaskStatus.COMPLETED).length },
  ];

  const employeePerformance = employees
    .filter(e => e.role !== 'MANAGER')
    .map(e => ({
      name: e.name.split(' ')[0], // Shorten name for mobile x-axis
      completed: tasks.filter(t => t.assignedToId === e.id && t.status === TaskStatus.COMPLETED).length,
      pending: tasks.filter(t => t.assignedToId === e.id && t.status !== TaskStatus.COMPLETED).length,
    }));

  const fetchInsights = async () => {
    setLoading(true);
    const result = await getDashboardInsights(tasks, employees);
    setInsights(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks]); 

  return (
    <div className="space-y-4 md:space-y-6 pb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl md:text-2xl font-bold text-blue-900 flex items-center gap-2">
          <TrendingUp className="w-6 h-6" /> Manager Command Center
        </h2>
        <button 
          onClick={fetchInsights} 
          disabled={loading}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 shadow-md transition-all text-sm md:text-base"
        >
          {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <BrainCircuit className="w-4 h-4" />}
          Refresh Insights
        </button>
      </div>

      {/* AI Insights Section */}
      <div className="bg-gradient-to-r from-blue-50 to-white p-4 md:p-6 rounded-xl border border-blue-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <h3 className="text-base md:text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-blue-600" /> AI Strategic Analysis
        </h3>
        <div className="prose prose-blue max-w-none text-gray-700 text-xs md:text-sm leading-relaxed">
          {loading ? (
             <div className="flex items-center gap-2 text-blue-500 animate-pulse">
               <Loader2 className="animate-spin w-4 h-4" /> Analyzing team performance...
             </div>
          ) : (
            insights ? (
              <div className="whitespace-pre-line">{insights}</div>
            ) : (
              <p className="text-gray-500">No data available for analysis.</p>
            )
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Task Status Chart */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-4">Task Distribution</h3>
          <div className="h-56 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 mt-2 text-xs md:text-sm text-gray-600">
             <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-blue-500"></div> To Do</div>
             <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> In Progress</div>
             <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-amber-500"></div> Completed</div>
          </div>
        </div>

        {/* Employee Performance Chart */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-4">Team Workload</h3>
          <div className="h-56 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={employeePerformance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} width={30} tick={{fontSize: 12}} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="completed" name="Completed" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                <Bar dataKey="pending" name="Pending" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-600 text-white p-4 md:p-5 rounded-xl shadow-lg shadow-blue-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-xs md:text-sm font-medium">Total Tasks</p>
              <h4 className="text-2xl md:text-3xl font-bold mt-1">{tasks.length}</h4>
            </div>
            <div className="p-2 bg-blue-500/30 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-50" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-xs md:text-sm font-medium">Completion Rate</p>
              <h4 className="text-2xl md:text-3xl font-bold mt-1 text-gray-800">
                {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === TaskStatus.COMPLETED).length / tasks.length) * 100) : 0}%
              </h4>
            </div>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-xs md:text-sm font-medium">Pending Urgent</p>
              <h4 className="text-2xl md:text-3xl font-bold mt-1 text-gray-800">
                {tasks.filter(t => t.status !== TaskStatus.COMPLETED).length}
              </h4>
            </div>
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;