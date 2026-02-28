
import React from 'react';
import { 
  Shield, 
  Layers, 
  Cpu, 
  Zap, 
  Database, 
  Workflow, 
  Terminal, 
  Server,
  Code,
  Box,
  Share2,
  Lock
} from 'lucide-react';

// Move Layout helper above ArchitectureCard usage
const LayoutIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>
);

// Fix: Change children to optional in the type definition to resolve the "missing children" error 
// that occurs in some TypeScript/React configurations when using custom components with children.
const ArchitectureCard = ({ title, icon: Icon, children }: { title: string, icon: any, children?: React.ReactNode }) => (
  <div className="cyber-card p-8 rounded-[2.5rem] bg-white/60">
    <div className="flex items-center gap-4 mb-6">
      <div className="p-3 bg-teal-50 rounded-2xl text-teal-600 border border-teal-100 shadow-sm">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold text-slate-800 tracking-tight uppercase">{title}</h3>
    </div>
    <div className="space-y-4 text-sm text-slate-600 leading-relaxed font-medium">
      {children}
    </div>
  </div>
);

const Architecture: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in zoom-in-95 duration-700 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500 text-white uppercase tracking-tighter shadow-sm">Whitepaper v4.2</span>
            <span className="text-slate-400 font-mono text-xs uppercase font-bold tracking-widest">Core Technical Specifications</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tighter">System Architecture</h1>
        </div>
        <div className="flex items-center gap-4 bg-teal-50 px-6 py-3 rounded-2xl border border-teal-100 shadow-sm">
          <Shield className="w-5 h-5 text-teal-600" />
          <span className="text-xs font-bold text-teal-700 uppercase tracking-widest">Enterprise Validated</span>
        </div>
      </div>

      <div className="cyber-card p-10 rounded-[2.5rem] bg-teal-600/5 border-teal-100">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
          <Box className="w-7 h-7 text-teal-600" />
          Overview
        </h2>
        <p className="text-lg text-slate-700 leading-loose tracking-tight font-medium max-w-4xl">
          The <span className="text-teal-600 font-bold">NexusAI Operational Management System</span> is built on a microservices-inspired monolithic architecture, designed for extreme low-latency response times and horizontal scalability across global clusters.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <ArchitectureCard title="Frontend Client" icon={LayoutIcon}>
          <p>Built with <span className="font-bold text-slate-800">React 18 & Vite</span> for near-instant load times.</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li><span className="font-bold">State:</span> Optimized React Context & Hooks.</li>
            <li><span className="font-bold">Viz:</span> Recharts for high-density telemetry.</li>
            <li><span className="font-bold">Comms:</span> Dual-channel Axios (REST) & Native WebSocket.</li>
          </ul>
        </ArchitectureCard>

        <ArchitectureCard title="Backend Server" icon={Server}>
          <p>Powered by <span className="font-bold text-slate-800">FastAPI</span> for asynchronous high-performance routing.</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li><span className="font-bold">Security:</span> OAuth2 + JWT (RS256).</li>
            <li><span className="font-bold">WS Manager:</span> Real-time broadcast engine.</li>
            <li><span className="font-bold">ORM:</span> SQLAlchemy with PostgreSQL ready drivers.</li>
          </ul>
        </ArchitectureCard>

        <ArchitectureCard title="AI Engine" icon={Cpu}>
          <p>Direct integration with <span className="font-bold text-slate-800">Gemini 3 Flash</span> for intelligence tasks.</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li><span className="font-bold">Prediction:</span> Simulated LSTM for load forecasting.</li>
            <li><span className="font-bold">Anomaly:</span> Z-score statistical behavioral analysis.</li>
            <li><span className="font-bold">NLP:</span> Context-aware intent detection.</li>
          </ul>
        </ArchitectureCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="cyber-card p-10 rounded-[2.5rem] bg-white/60">
          <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-4">
            <Workflow className="w-7 h-7 text-amber-600" />
            Adaptive Optimizer
          </h3>
          <div className="space-y-6 text-slate-600 font-medium">
            <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 font-mono text-xs text-amber-800">
              Score = (Priority * 20) - (Cost * 0.1) - (Load * 0.5)
            </div>
            <p className="leading-relaxed">
              Our optimizer uses a greedy heuristic combined with Reinforcement Learning (RL) principles. It minimizes total burn rate while maximizing node utilization through real-time telemetry input.
            </p>
            <div className="flex gap-4">
              <div className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Complexity</p>
                <p className="text-sm font-bold text-slate-800">O(n log n)</p>
              </div>
              <div className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Efficiency</p>
                <p className="text-sm font-bold text-slate-800">94.2%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="cyber-card p-10 rounded-[2.5rem] bg-white/60">
          <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-4">
            <Share2 className="w-7 h-7 text-teal-600" />
            Data Flow Lifecycle
          </h3>
          <div className="relative pl-8 border-l-2 border-slate-100 space-y-8">
            <div className="relative">
              <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-teal-500 shadow-sm border-4 border-white"></div>
              <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">Trigger</p>
              <p className="text-sm font-bold text-slate-800">Client Protocol Initiation (Task POST)</p>
            </div>
            <div className="relative">
              <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-slate-300 shadow-sm border-4 border-white"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Persistence</p>
              <p className="text-sm font-bold text-slate-800">ACID compliant write to System State</p>
            </div>
            <div className="relative">
              <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-amber-500 shadow-sm border-4 border-white animate-pulse"></div>
              <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Broadcast</p>
              <p className="text-sm font-bold text-slate-800">WebSocket broadcast to Fleet Hub</p>
            </div>
          </div>
        </div>
      </div>

      <div className="cyber-card p-12 rounded-[3rem] bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-teal-500/10 to-transparent"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="space-y-6 max-w-2xl">
            <div className="flex items-center gap-3">
              <Terminal className="w-6 h-6 text-teal-400" />
              <h3 className="text-2xl font-bold tracking-tight">Scalability & Enterprise Readiness</h3>
            </div>
            <p className="text-slate-400 leading-relaxed font-medium">
              The system is architected for zero-downtime migrations. By swapping environment variables, the database layer transparently shifts from edge-optimized SQLite to full-scale PostgreSQL clusters.
            </p>
            <div className="flex flex-wrap gap-4">
              <span className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-xs font-mono">Docker/K8s Ready</span>
              <span className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-xs font-mono">Redis Cache Tier Supported</span>
              <span className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-xs font-mono">Multi-region Replication</span>
            </div>
          </div>
          <div className="p-8 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-4 mb-4">
              <Lock className="w-5 h-5 text-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Security Layer</span>
            </div>
            <p className="text-xs font-mono text-emerald-400 font-bold mb-4">ENCRYPTION: AES-256-GCM</p>
            <p className="text-xs font-mono text-slate-500">AUTH: JWT STATELESS</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Architecture;
