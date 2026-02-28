import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Server, Shield, Activity, Clock } from 'lucide-react';
import { mockBackend } from '../services/mockBackend';
import { Resource, Task } from '../types';
import { authApi } from '../services/api';

const AdminDashboard: React.FC = () => {
    const { user } = useAuth();
    const [usersList, setUsersList] = useState<any[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [activeUserId, setActiveUserId] = useState<number | null>(null);

    const filteredTasks = activeUserId !== null ? tasks.filter(t => t.userId === activeUserId) : [];

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                // In a real app we'd have a mockBackend method or a direct axios API call for users
                const res = await authApi.getUsers();
                setUsersList(res.data);
            } catch (err) {
                console.error("Failed to fetch users", err);
            }

            mockBackend.getResources().then(setResources);
            mockBackend.getTasks().then(setTasks);
        };
        fetchAdminData();

        const unsubscribe = mockBackend.subscribe((event) => {
            if (event.type === 'LOAD_UPDATE') setResources(event.data);
            if (event.type === 'TASK_UPDATE') setTasks(event.data);
        });
        return unsubscribe;
    }, []);

    return (
        <div className="space-y-10 animate-in fade-in zoom-in-95 duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-600 text-white uppercase tracking-tighter shadow-sm">Overwatch Active</span>
                        <span className="text-slate-400 font-mono text-xs uppercase font-bold tracking-widest">Global Admin S-ID: NX-1</span>
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tighter">System Administration</h1>
                </div>
                <div className="px-4 py-2 bg-slate-900 text-white rounded-xl shadow-lg border border-slate-700 font-bold text-sm">
                    {usersList.length} Active Operators
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Users Directory */}
                <div className="cyber-card p-10 rounded-[2.5rem] bg-white/60 overflow-hidden flex flex-col max-h-[500px]">
                    <div className="flex items-center gap-4 mb-8 shrink-0">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Users className="w-6 h-6" /></div>
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Operator Directory</h2>
                    </div>
                    <div className="overflow-y-auto pr-2 space-y-4">
                        {usersList.length === 0 ? (
                            <div className="text-center text-slate-400 text-sm py-8 font-mono">Loading operator data...</div>
                        ) : (
                            usersList.map(u => (
                                <div
                                    key={u.id}
                                    onClick={() => setActiveUserId(u.id === activeUserId ? null : u.id)}
                                    className={`p-4 border rounded-2xl flex items-center justify-between cursor-pointer transition-colors ${activeUserId === u.id ? 'border-teal-500 bg-teal-50' : 'border-slate-100 bg-white hover:bg-slate-50'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.email}`} alt="avatar" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800 tracking-tight">{u.email}</p>
                                            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest mt-0.5">
                                                ID: {u.id} • {u.is_active ? 'Active' : 'Offline'}
                                            </p>
                                        </div>
                                    </div>
                                    {u.is_admin ? (
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-100 rounded-lg text-rose-600">
                                            <Shield className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Admin</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-500">
                                            <span className="text-[10px] font-black uppercase tracking-widest">Operator</span>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* System Processes */}
                <div className="cyber-card p-10 rounded-[2.5rem] bg-slate-900 border-slate-800 text-slate-200 flex flex-col max-h-[500px]">
                    <div className="flex items-center gap-4 mb-8 shrink-0">
                        <div className="p-3 bg-teal-500/20 text-teal-400 rounded-xl border border-teal-500/20"><Activity className="w-6 h-6" /></div>
                        <h2 className="text-2xl font-bold tracking-tight text-white">Process Supervisor</h2>
                    </div>
                    <div className="overflow-y-auto pr-2 space-y-4 font-mono text-xs">
                        {activeUserId === null ? (
                            <div className="text-slate-500 text-center py-8">Select an operator from the directory to monitor their active process queue.</div>
                        ) : filteredTasks.length === 0 ? (
                            <div className="text-slate-500 text-center py-8">No active processes for this operator.</div>
                        ) : (
                            filteredTasks.map(task => (
                                <div key={task.id} className={`p-4 border rounded-xl flex items-center justify-between ${task.status === 'COMPLETED' ? 'border-emerald-500/20 bg-emerald-500/5' : task.status === 'IN_PROGRESS' ? 'border-amber-500/20 bg-amber-500/5' : 'border-slate-700 bg-slate-800'}`}>
                                    <div className="space-y-1">
                                        <p className={`font-bold uppercase tracking-widest text-[10px] ${task.status === 'COMPLETED' ? 'text-emerald-400' : task.status === 'IN_PROGRESS' ? 'text-amber-400' : 'text-slate-400'}`}>{task.status}</p>
                                        <p className="font-semibold text-slate-200">{task.title}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-slate-500">Node: {task.assigned_resource_id || 'N/A'}</p>
                                        <p className="text-slate-600 text-[10px] mt-0.5"><Clock className="inline w-3 h-3 mr-1" />{task.estimated_time || task.estimatedTime}m est.</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
