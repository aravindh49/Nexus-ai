
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { mockBackend } from '../services/mockBackend';
import { Resource, Anomaly, PredictionPoint } from '../types';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Zap,
  FileDown,
  RefreshCw,
  Layers,
  Shield,
  Clock,
  Terminal
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '../context/ToastContext';

const StatCard = ({ title, value, subValue, icon: Icon, trend, color }: any) => {
  const colorMap: any = {
    teal: 'text-teal-600 bg-teal-50 border-teal-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
  };

  return (
    <div className="cyber-card p-7 rounded-[2rem]">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-4 rounded-2xl border ${colorMap[color] || 'text-slate-600 bg-slate-50 border-slate-100'}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${trend > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
            <TrendingUp className={`w-3 h-3 ${trend < 0 ? 'rotate-180' : ''}`} />
            <span className="text-[11px] font-bold tracking-tight">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.15em] mb-1">{title}</p>
      <div className="flex items-baseline gap-3">
        <h3 className="text-3xl font-bold text-slate-800 tracking-tighter font-mono">{value}</h3>
        <p className="text-[11px] text-slate-500 font-medium">{subValue}</p>
      </div>
      <div className="mt-6 h-1 w-1/3 rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color === 'teal' ? 'bg-teal-500' : color === 'amber' ? 'bg-amber-500' : 'bg-slate-400'}`} style={{ width: '40%' }}></div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [alerts, setAlerts] = useState<Anomaly[]>([]);
  const [predictions, setPredictions] = useState<PredictionPoint[]>([]);
  const [logs, setLogs] = useState<string[]>([`[${new Date().toLocaleTimeString()}] NEXUS_CMD_CORE: Initializing secure uplink...`]);
  const [timeHorizon, setTimeHorizon] = useState<'24h' | '7d'>('24h');
  const { showToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      const res = await mockBackend.getResources();
      const pred = await mockBackend.getWorkloadPredictions();
      setResources(res);
      setPredictions(pred);
    };
    fetchData();

    const unsubscribe = mockBackend.subscribe((event) => {
      if (event.type === 'LOAD_UPDATE') {
        setResources(event.data);
        setLogs(prev => [`[${new Date().toLocaleTimeString()}] SYS_SYNC: Received automated telemetry from Node Clusters.`, ...prev].slice(0, 15));
      }
      if (event.type === 'ANOMALY_DETECTED') {
        setAlerts(prev => [event.data, ...prev].slice(0, 4));
        setLogs(prev => [`[${new Date().toLocaleTimeString()}] **CRITICAL EXCEPTION**: THREAD_LOCK - ${event.data.message}`, ...prev].slice(0, 15));
      }
      if (event.type === 'TASK_UPDATE') {
        setLogs(prev => [`[${new Date().toLocaleTimeString()}] TASK_OP: Execution sequence lifecycle updated automatically.`, ...prev].slice(0, 15));
      }
    });
    return unsubscribe;
  }, []);

  const downloadReport = async () => {
    const element = document.getElementById('dashboard-content');
    if (!element) return;
    const canvas = await html2canvas(element, { backgroundColor: '#fdfcf0' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, (canvas.height * pdfWidth) / canvas.width);
    pdf.save('NEXUS_TELEMETRY_REPORT.pdf');
  };

  const radarData = [
    { subject: 'CPU', A: 85, B: 110 },
    { subject: 'MEM', A: 98, B: 130 },
    { subject: 'STO', A: 86, B: 130 },
    { subject: 'LAT', A: 99, B: 100 },
    { subject: 'NET', A: 85, B: 90 },
  ];

  return (
    <div className="space-y-10 animate-in fade-in zoom-in-95 duration-700" id="dashboard-content">
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-teal-600 text-white uppercase tracking-tighter shadow-sm">Live Telemetry</span>
            <span className="text-slate-400 font-mono text-xs uppercase font-bold tracking-widest">S-ID: NX-8842</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tighter">Command Overview</h1>
        </div>
        <div className="flex gap-4">
          <button className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl transition-all text-slate-500 shadow-sm">
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={downloadReport}
            className="flex items-center gap-3 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl px-8 py-3.5 shadow-lg shadow-teal-600/20 transition-all font-bold text-sm tracking-tight"
          >
            <FileDown className="w-5 h-5" />
            Export Audit Log
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard title="Active Nodes" value={resources.length} subValue="READY" icon={Layers} color="teal" trend={12} />
        <StatCard title="Throughput" value="94.2%" subValue="OPTIMAL" icon={Zap} color="amber" trend={2} />
        <StatCard title="Average Load" value="68.4" subValue="NOMINAL" icon={Activity} color="emerald" trend={-5} />
        <StatCard title="Daily Burn" value="$12.4k" subValue="BUDGET" icon={Clock} color="blue" trend={8} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 cyber-card p-10 rounded-[2.5rem]">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Predictive Workload</h2>
              <p className="text-xs text-slate-400 mt-1 font-bold uppercase tracking-widest">Gemini Engine V3 Active</p>
            </div>
            <div className="flex p-1 bg-slate-50 rounded-xl border border-slate-200">
              <button
                onClick={() => { setTimeHorizon('24h'); showToast('Telemetry span adjusted to 24 Hours', 'info'); }}
                className={`px-4 py-1.5 text-[10px] font-bold transition-all ${timeHorizon === '24h' ? 'text-teal-700 bg-white rounded-lg shadow-sm border border-slate-100' : 'text-slate-400'}`}
              >24 HOURS</button>
              <button
                onClick={() => { setTimeHorizon('7d'); showToast('Telemetry span adjusted to 7 Days (Projected)', 'info'); }}
                className={`px-4 py-1.5 text-[10px] font-bold transition-all ${timeHorizon === '7d' ? 'text-teal-700 bg-white rounded-lg shadow-sm border border-slate-100' : 'text-slate-400'}`}
              >7 DAYS</button>
            </div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={predictions}>
                <defs>
                  <linearGradient id="cyberGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} dy={15} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} dx={-15} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: '#0d9488', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="predicted" stroke="#0d9488" strokeWidth={4} fill="url(#cyberGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="cyber-card p-10 rounded-[2.5rem]">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-8">Asset Health</h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                <Radar name="Target" dataKey="B" stroke="#0d9488" fill="#0d9488" fillOpacity={0.1} />
                <Radar name="Live" dataKey="A" stroke="#d97706" fill="#d97706" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 flex justify-center gap-6">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-teal-500"></div><span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Optimal</span></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"></div><span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Current</span></div>
          </div>
        </div>
      </div>

      {/* Terminal Log Output */}
      <div className="cyber-card p-0 rounded-[2.5rem] bg-slate-900 border-slate-800 overflow-hidden shadow-2xl">
        <div className="px-8 py-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Terminal className="w-5 h-5 text-teal-500" />
            <h2 className="text-sm font-bold text-slate-200 tracking-tight font-mono">SYS_TERMINAL_FEED</h2>
          </div>
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          </div>
        </div>
        <div className="p-8 h-[250px] overflow-y-auto scrollbar-hide flex flex-col-reverse font-mono text-[11px] leading-relaxed">
          {logs.map((log, i) => (
            <div key={i} className={`py-1 ${log.includes('CRITICAL') ? 'text-rose-400 font-bold' : log.includes('TASK_OP') ? 'text-blue-400' : 'text-teal-500/80'}`}>
              {log}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pb-10">
        <div className="cyber-card p-10 rounded-[2.5rem]">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-8">Node Saturation</h2>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resources}>
                <XAxis dataKey="name" hide />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }} />
                <Bar dataKey="currentLoad" radius={[8, 8, 8, 8]} barSize={40}>
                  {resources.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.currentLoad > 85 ? '#e11d48' : entry.currentLoad > 60 ? '#d97706' : '#0d9488'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="cyber-card p-10 rounded-[2.5rem] border-rose-100">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Active Anomalies</h2>
            <Shield className="w-6 h-6 text-rose-500 opacity-30" />
          </div>
          <div className="space-y-5">
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                <CheckCircle2 className="w-16 h-16 mb-4 text-emerald-500/20" />
                <p className="font-bold tracking-widest text-[11px] uppercase">Telemetry Stable</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div key={alert.id} className={`flex gap-6 p-6 rounded-3xl border ${alert.severity === 'critical' ? 'border-rose-100 bg-rose-50/50' : 'border-amber-100 bg-amber-50/50'}`}>
                  <div className={`p-4 rounded-2xl h-fit ${alert.severity === 'critical' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-800 tracking-tight uppercase leading-none mb-2">{alert.type}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4">{alert.message}</p>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                      <button className="text-[10px] font-black text-teal-600 uppercase tracking-widest hover:text-teal-800 transition-colors">Acknowledge</button>
                    </div>
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

export default Dashboard;
