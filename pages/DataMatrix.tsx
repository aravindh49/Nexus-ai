import React from 'react';
import { Activity, ShieldAlert, Cpu, Lock, Network, Zap } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const dummyData = [
    { time: '00:00', ingress: 4000, egress: 2400, threat: 20 },
    { time: '04:00', ingress: 3000, egress: 1398, threat: 40 },
    { time: '08:00', ingress: 2000, egress: 9800, threat: 10 },
    { time: '12:00', ingress: 2780, egress: 3908, threat: 80 },
    { time: '16:00', ingress: 1890, egress: 4800, threat: 15 },
    { time: '20:00', ingress: 2390, egress: 3800, threat: 25 },
    { time: '24:00', ingress: 3490, egress: 4300, threat: 30 },
];

const DataMatrix: React.FC = () => {
    return (
        <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-600 text-white uppercase tracking-tighter">Classified</span>
                        <span className="text-slate-400 font-mono text-xs uppercase font-bold tracking-widest">Protocol Override</span>
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tighter">Security Matrix</h1>
                    <p className="text-slate-500 mt-1 font-bold uppercase tracking-widest text-[10px]">Real-time Threat & Traffic Analysis</p>
                </div>
                <div className="flex items-center gap-3 bg-slate-900 border border-slate-700 text-white px-5 py-3 rounded-2xl shadow-lg font-bold text-sm tracking-tight cursor-default">
                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    Monitoring Active Firewalls
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="cyber-card p-8 rounded-[2.5rem] bg-slate-900 border-slate-800 text-white shadow-xl shadow-rose-900/10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-rose-500/20 rounded-xl text-rose-500"><ShieldAlert className="w-6 h-6" /></div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase">Threat Baseline</p>
                            <h2 className="text-2xl font-bold font-mono">Defcon 3</h2>
                        </div>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed font-mono">Warning: External brute-force vectors detected on Node-01. Firewall mitigation in effect.</p>
                </div>
                <div className="cyber-card p-8 rounded-[2.5rem] border-slate-200">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-teal-50 rounded-xl text-teal-600"><Network className="w-6 h-6" /></div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase">Routing Mesh</p>
                            <h2 className="text-2xl font-bold font-mono">99.8% Uptime</h2>
                        </div>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed font-mono">Subnet routing optimal. No packet loss observed across the primary cluster edge.</p>
                </div>
                <div className="cyber-card p-8 rounded-[2.5rem] border-slate-200">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-amber-50 rounded-xl text-amber-600"><Lock className="w-6 h-6" /></div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase">Encryption Standard</p>
                            <h2 className="text-2xl font-bold font-mono">AES-256-GCM</h2>
                        </div>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed font-mono">All in-transit data dynamically encrypted. Certificate rotation scheduled in 48 hours.</p>
                </div>
            </div>

            <div className="cyber-card p-10 rounded-[2.5rem]">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Traffic vs Threat Saturation</h2>
                    <Zap className="w-6 h-6 text-amber-400" />
                </div>
                <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dummyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                            <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '11px', fontWeight: 'bold' }} iconType="circle" />
                            <Line type="monotone" dataKey="ingress" stroke="#0d9488" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="egress" stroke="#d97706" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="threat" stroke="#e11d48" strokeWidth={3} strokeDasharray="5 5" dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default DataMatrix;
