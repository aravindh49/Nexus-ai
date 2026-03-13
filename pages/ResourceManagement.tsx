
import React, { useState, useEffect } from 'react';
import { mockBackend } from '../services/mockBackend';
import { Resource, ResourceStatus } from '../types';
import { Server, Database, HardDrive, Plus, MoreVertical } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import TopologyMap from './TopologyMap';

const ResourceManagement: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    mockBackend.getResources().then(setResources);
    const unsubscribe = mockBackend.subscribe((event) => {
      if (event.type === 'LOAD_UPDATE') setResources(event.data);
    });
    return unsubscribe;
  }, []);

  const getStatusColor = (status: ResourceStatus) => {
    switch (status) {
      case ResourceStatus.NORMAL: return 'text-teal-600 bg-teal-50 border-teal-100';
      case ResourceStatus.HIGH_LOAD: return 'text-amber-600 bg-amber-50 border-amber-100';
      case ResourceStatus.CRITICAL: return 'text-rose-600 bg-rose-50 border-rose-100';
    }
  };

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'gpu': return <Database className="w-5 h-5" />;
      case 'storage': return <HardDrive className="w-5 h-5" />;
      default: return <Server className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tighter">Infrastructure Hub</h1>
          <p className="text-slate-500 mt-1 font-bold uppercase tracking-widest text-[10px]">Active Node Distribution</p>
        </div>
        <button className="flex items-center gap-3 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-2xl transition-all shadow-lg shadow-teal-600/20 font-bold text-sm tracking-tight">
          <Plus className="w-5 h-5" />
          Provision Node
        </button>
      </div>

      {resources.length > 0 && <TopologyMap resources={resources} />}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        {resources.map((res) => (
          <div key={res.id} className="cyber-card rounded-[2.5rem] p-8">
            <div className="flex justify-between items-start mb-8">
              <div className="p-4 bg-teal-50 rounded-2xl text-teal-600 border border-teal-100 shadow-sm">
                {getIcon(res.type)}
              </div>
              <div className="relative">
                <button
                  onClick={() => setActiveMenu(activeMenu === res.id ? null : res.id)}
                  className="text-slate-300 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-50"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                {activeMenu === res.id && (
                  <div className="absolute right-0 top-10 w-48 bg-white border border-slate-200 shadow-xl rounded-2xl py-2 z-10 animate-in zoom-in-95 font-medium text-sm">
                    <button onClick={() => { showToast(`Diagnostic run initiated for ${res.name}`, 'info'); setActiveMenu(null); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700">Run Diagnostics</button>
                    <button onClick={() => { showToast(`Node ${res.name} restarted successfully`, 'success'); setActiveMenu(null); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700">Restart Node</button>
                    <div className="h-px bg-slate-100 my-1"></div>
                    <button onClick={() => { showToast(`Node ${res.name} decommissioned`, 'error'); setActiveMenu(null); }} className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600">Decommission</button>
                  </div>
                )}
              </div>
            </div>

            <h3 className="text-xl font-bold text-slate-800 mb-1 tracking-tight uppercase">{res.name}</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-8">{res.type} Array</p>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                  <span className="text-slate-400">Current Load</span>
                  <span className={res.currentLoad > 80 ? 'text-rose-500' : 'text-teal-600 font-mono'}>{res.currentLoad}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${res.currentLoad > 80 ? 'bg-rose-500 shadow-sm' : res.currentLoad > 60 ? 'bg-amber-500' : 'bg-teal-500 shadow-sm'}`}
                    style={{ width: `${res.currentLoad}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[9px] uppercase text-slate-400 font-black mb-1 tracking-tighter">BURN RATE</p>
                  <p className="text-sm font-bold text-slate-800 font-mono">${res.costPerHour}/h</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[9px] uppercase text-slate-400 font-black mb-1 tracking-tighter">LATENCY</p>
                  <p className="text-sm font-bold text-slate-800 font-mono">{res.metrics.latency}ms</p>
                </div>
              </div>

              <div className={`text-center py-3 rounded-xl border text-[10px] font-black tracking-[0.2em] uppercase ${getStatusColor(res.status)} shadow-sm`}>
                {res.status.replace('_', ' ')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourceManagement;
