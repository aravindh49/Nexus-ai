import React, { useState, useEffect } from 'react';
import { mockBackend } from '../services/mockBackend';
import { useAuth } from '../context/AuthContext';
import { Task, TaskStatus, TaskPriority, Resource } from '../types';
import { Clock, CheckCircle2, Zap, MoreHorizontal, Filter, Plus, X, Activity, Timer, Layers } from 'lucide-react';

const TaskManagement: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [optimizing, setOptimizing] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'ALL'>('ALL');

  // Form State
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [estimatedTime, setEstimatedTime] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const init = async () => {
      setTasks(await mockBackend.getTasks());
      setResources(await mockBackend.getResources());
    };
    init();

    // Subscribe to real-time updates (Simulated WebSocket)
    const unsubscribe = mockBackend.subscribe((event) => {
      if (event.type === 'TASK_UPDATE') {
        if (user?.is_admin) {
          setTasks(event.data);
        } else {
          // Filter websocket updates so normal users only see their own tasks
          // If the user hasn't relogged and doesn't have an ID in their token, 
          // the initial fetch will get their tasks, and we match updates by ID
          setTasks(prev => {
            const myTaskIds = new Set(prev.map(t => t.id));
            // Only accept updates for tasks we already know about, OR those that belong to us explicitly
            return event.data.filter((t: Task) => (user?.id && t.userId === user.id) || myTaskIds.has(t.id));
          });
        }
      } else if (event.type === 'LOAD_UPDATE') {
        mockBackend.getResources().then(setResources);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleAIAutoAssign = async (taskId: string) => {
    setOptimizing(taskId);
    await new Promise(r => setTimeout(r, 1500));
    try {
      await mockBackend.optimizeAssignment(taskId);
    } finally {
      setOptimizing(null);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 800)); // Simulate network latency

    await mockBackend.addTask(title, priority, parseFloat(estimatedTime));

    setTitle('');
    setPriority(TaskPriority.MEDIUM);
    setEstimatedTime('1');
    setIsSubmitting(false);
    setIsModalOpen(false);
  };

  const getPriorityTag = (p: TaskPriority) => {
    switch (p) {
      case TaskPriority.URGENT: return 'bg-rose-50 text-rose-600 border-rose-100';
      case TaskPriority.HIGH: return 'bg-amber-50 text-amber-600 border-amber-100';
      case TaskPriority.MEDIUM: return 'bg-teal-50 text-teal-600 border-teal-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getStatusColorClass = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED: return 'bg-emerald-500';
      case TaskStatus.IN_PROGRESS: return 'bg-teal-500';
      case TaskStatus.ASSIGNED: return 'bg-amber-400';
      default: return 'bg-slate-300';
    }
  };

  const filteredTasks = filterStatus === 'ALL'
    ? tasks
    : tasks.filter(t => t.status === filterStatus);

  const statuses = [
    { label: 'All Operations', value: 'ALL' },
    { label: 'Pending', value: TaskStatus.PENDING },
    { label: 'Assigned', value: TaskStatus.ASSIGNED },
    { label: 'In Progress', value: TaskStatus.IN_PROGRESS },
    { label: 'Completed', value: TaskStatus.COMPLETED },
  ];

  return (
    <div className="space-y-10 animate-in slide-in-from-right-4 duration-700">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tighter">Operation Flow</h1>
            <div className="flex items-center gap-2 px-2.5 py-1 bg-teal-50 rounded-full border border-teal-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
              <span className="text-[9px] font-black text-teal-600 uppercase tracking-widest">Live Link: Operational</span>
            </div>
          </div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Dynamic Workload Management</p>
        </div>
        <div className="flex gap-4">
          <div className="flex bg-white/50 backdrop-blur-sm border border-slate-200 p-1 rounded-2xl shadow-sm">
            {statuses.map((s) => (
              <button
                key={s.value}
                onClick={() => setFilterStatus(s.value as any)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === s.value
                    ? 'bg-white text-teal-600 shadow-sm border border-slate-100'
                    : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-3 bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-2xl transition-all shadow-lg shadow-teal-600/20 font-bold text-sm tracking-tight"
          >
            <Plus className="w-5 h-5" />
            New Operation
          </button>
        </div>
      </div>

      <div className="cyber-card rounded-[2.5rem] overflow-hidden bg-white/60 min-h-[400px]">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-300 animate-in fade-in duration-500">
            <Layers className="w-20 h-20 mb-6 opacity-10" />
            <p className="font-bold tracking-[0.2em] text-xs uppercase">No matching operations in current filter</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Telemetry Reference</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Priority</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Health</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Assignment</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Countdown</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.map((task) => (
                <tr key={task.id} className="group hover:bg-slate-50/50 transition-colors animate-in fade-in duration-300">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100 shadow-sm">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 tracking-tight uppercase">{task.title}</p>
                        <p className="text-[10px] text-slate-400 font-mono font-bold tracking-tighter">SEQ: {task.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase border ${getPriorityTag(task.priority)}`}>
                      {TaskPriority[task.priority]}
                    </span>
                  </td>
                  <td className={`px-8 py-6 transition-all duration-1000 ${task.status === TaskStatus.COMPLETED ? 'animate-success-flash' : ''}`}>
                    <div
                      key={`status-container-${task.id}-${task.status}`}
                      className={`flex items-center gap-2.5 ${task.status === TaskStatus.COMPLETED ? 'animate-success-pulse' : 'animate-status-pop'}`}
                    >
                      <div className="relative flex items-center justify-center w-4 h-4">
                        <span
                          key={`ripple-${task.id}-${task.status}`}
                          className={`absolute inset-0 rounded-full animate-status-ripple opacity-0 ${getStatusColorClass(task.status)}`}
                        ></span>
                        <span
                          className={`relative w-2 h-2 rounded-full transition-all duration-700 ${getStatusColorClass(task.status)
                            } ${task.status === TaskStatus.IN_PROGRESS ? 'animate-pulse' : ''} shadow-sm`}
                        ></span>
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-500 ${task.status === TaskStatus.COMPLETED ? 'text-emerald-600' : 'text-slate-600'
                        }`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {task.assignedResourceId ? (
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-slate-700 tracking-tight uppercase">
                          {resources.find(r => r.id === task.assignedResourceId)?.name || 'Processing...'}
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAIAutoAssign(task.id)}
                        disabled={optimizing === task.id}
                        className="flex items-center gap-2.5 text-[10px] font-black text-teal-600 hover:text-white transition-all uppercase tracking-widest bg-teal-50 px-4 py-2 rounded-xl border border-teal-100 hover:bg-teal-600 shadow-sm disabled:opacity-30"
                      >
                        {optimizing === task.id ? (
                          <div className="animate-spin w-3 h-3 border-2 border-teal-400 border-t-transparent rounded-full" />
                        ) : (
                          <Zap className="w-3.5 h-3.5" />
                        )}
                        {optimizing === task.id ? 'Analyzing...' : 'Auto-Optimize'}
                      </button>
                    )}
                  </td>
                  <td className="px-8 py-6 text-[11px] text-slate-400 font-mono font-bold italic tracking-tighter">
                    T-MINUS {task.estimatedTime}H
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="text-slate-300 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-lg">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* New Operation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="cyber-card w-full max-w-lg bg-white rounded-[3rem] p-10 shadow-2xl relative animate-in slide-in-from-bottom-10 duration-500 overflow-hidden">
            <div className="absolute top-0 right-0 p-8">
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-800 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-teal-50 rounded-2xl text-teal-600 border border-teal-100">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Initiate Operation</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-mono">Sequence Nexus-Alpha</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Operation Title</label>
                <input
                  autoFocus
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Quantum Data Re-Indexing"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Priority Level</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 appearance-none transition-all"
                  >
                    <option value={TaskPriority.LOW}>Low Intensity</option>
                    <option value={TaskPriority.MEDIUM}>Standard Priority</option>
                    <option value={TaskPriority.HIGH}>High Urgency</option>
                    <option value={TaskPriority.URGENT}>Critical Path</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 flex items-center gap-2">
                    <Timer className="w-3 h-3" /> Estimated Time (h)
                  </label>
                  <input
                    required
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] bg-teal-600 hover:bg-teal-700 text-white rounded-2xl py-4 transition-all shadow-lg shadow-teal-600/20 font-bold text-sm tracking-tight flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                      Provisioning...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Deploy Operation
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManagement;