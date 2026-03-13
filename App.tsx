
import React from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Cpu,
  ListTodo,
  MessageSquare,
  LogOut,
  Bell,
  Search,
  Command,
  ShieldCheck,
  BookOpen,
  Settings as SettingsIcon,
  Menu,
  Activity,
  Globe
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import ResourceManagement from './pages/ResourceManagement';
import TaskManagement from './pages/TaskManagement';
import AIChat from './pages/AIChat';
import DataMatrix from './pages/DataMatrix';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Settings from './pages/Settings';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { mockBackend } from './services/mockBackend';

const Navigation = ({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (val: boolean) => void }) => {
  const location = useLocation();
  const { logout } = useAuth();
  const navItems = [
    { path: '/', label: 'Overview', icon: LayoutDashboard },
    { path: '/resources', label: 'Nodes', icon: Cpu },
    { path: '/tasks', label: 'Ops Board', icon: ListTodo },
    { path: '/ai-chat', label: 'Nexus AI', icon: MessageSquare },
    { path: '/data-matrix', label: 'Security Center', icon: Activity },
  ];

  return (
    <nav className={`glass h-screen sticky top-0 flex flex-col py-8 border-r border-slate-200 shadow-xl z-50 transition-all duration-300 ${isOpen ? 'w-72 px-8' : 'w-24 px-4 items-center'}`}>
      <div className={`flex items-center mb-12 ${isOpen ? 'gap-4 w-full' : 'flex-col gap-6 w-full'}`}>
        <div className="relative group cursor-pointer shrink-0" onClick={() => setIsOpen(!isOpen)}>
          <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-amber-500 rounded-xl blur opacity-20 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-slate-200 shadow-sm text-teal-600 hover:text-teal-700">
            <Command className="w-7 h-7" />
          </div>
        </div>
        {isOpen && (
          <div className="flex-1 overflow-hidden" onClick={() => setIsOpen(!isOpen)}>
            <h1 className="text-xl font-bold tracking-tighter text-slate-800 cursor-pointer">NEXUS<span className="text-teal-600">AI</span></h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Operational Hub</p>
          </div>
        )}
        <button onClick={() => setIsOpen(!isOpen)} className={`p-2 text-slate-400 hover:text-slate-800 transition-colors rounded-xl bg-slate-50 border border-slate-100 shadow-sm shrink-0 ${!isOpen && 'mt-2'}`}>
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className={`flex-1 space-y-3 w-full ${!isOpen && 'flex flex-col items-center'}`}>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            title={item.label}
            className={`flex items-center rounded-2xl transition-all duration-300 group ${location.pathname === item.path
              ? 'bg-teal-50 text-teal-700 border border-teal-100 shadow-sm'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent hover:border-slate-100'
              } ${isOpen ? 'gap-4 px-5 py-3.5' : 'justify-center w-14 h-14'}`}
          >
            <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 shrink-0 ${location.pathname === item.path ? 'text-teal-600' : 'text-slate-400'
              }`} />
            {isOpen && <span className="font-semibold text-sm tracking-tight whitespace-nowrap">{item.label}</span>}
          </Link>
        ))}
      </div>

      <div className={`pt-8 border-t border-slate-100 space-y-4 w-full ${!isOpen && 'flex flex-col items-center'}`}>
        {isOpen ? (
          <div className="flex items-center gap-3 px-5 py-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Protocol v4.2</span>
          </div>
        ) : (
          <div className="flex justify-center p-2 mb-2" title="Protocol v4.2"><ShieldCheck className="w-5 h-5 text-emerald-600" /></div>
        )}
        <Link to="/settings" title="Settings" className={`w-full flex items-center transition-colors text-sm rounded-xl ${isOpen ? 'gap-4 px-5 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-900' : 'justify-center w-14 h-14 text-slate-400 hover:bg-slate-50 hover:text-teal-600'}`}>
          <SettingsIcon className="w-5 h-5 shrink-0" />
          {isOpen && <span className="font-medium">Settings</span>}
        </Link>
        <button onClick={logout} title="Disconnect" className={`w-full flex items-center transition-colors text-sm rounded-xl ${isOpen ? 'gap-4 px-5 py-3 text-rose-600 hover:bg-rose-50 hover:text-rose-700' : 'justify-center w-14 h-14 text-rose-400 hover:bg-rose-50 hover:text-rose-600'}`}>
          <LogOut className="w-5 h-5 shrink-0" />
          {isOpen && <span className="font-medium">Disconnect</span>}
        </button>
      </div>
    </nav>
  );
};

const Header = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [alerts, setAlerts] = React.useState<any[]>([
    { id: '1', message: 'GPU Cluster Node-01 Sustained High Load', type: 'high', time: '2m ago' },
    { id: '2', message: 'API Server West-2 Throttling', type: 'critical', time: '15m ago' }
  ]);
  const [showNotifications, setShowNotifications] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = mockBackend.subscribe((event) => {
      if (event.type === 'ANOMALY_DETECTED') {
        setAlerts(prev => [{
          id: event.data.id,
          message: event.data.message,
          type: event.data.severity === 'critical' ? 'critical' : 'high',
          time: 'Just now',
          resourceId: event.data.resourceId,
        }, ...prev]);
        setShowNotifications(true);
      } else if (event.type === 'ANOMALY_RESOLVED') {
        showToast(event.data.message, 'success');
        setAlerts(prev => prev.filter(a => String(a.resourceId) !== String(event.data.resourceId)));
      }
    });
    return unsubscribe;
  }, [showToast]);

  return (
    <header className="h-24 px-10 flex items-center justify-between sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 transition-all duration-300">
      <div className="flex items-center gap-10">
        <div className="relative w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
          <input
            type="text"
            placeholder="Search logs & nodes..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500/50 transition-all placeholder:text-slate-400 text-slate-800"
          />
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest px-3 py-1 bg-white border border-slate-200 rounded-lg">
            <Globe className="w-3 h-3 text-teal-600" />
            US-WEST-1 CLUSTER
          </div>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="relative group cursor-pointer" onClick={() => setShowNotifications(!showNotifications)}>
          <Bell className="w-5 h-5 text-slate-400 hover:text-teal-600 transition-colors" />
          {alerts.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
          )}

          {showNotifications && (
            <div className="absolute top-10 right-0 w-80 bg-white border border-slate-200 shadow-2xl rounded-2xl p-4 z-50 animate-in slide-in-from-top-2 fade-in">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 tracking-tight">System Alerts</h3>
                <button onClick={(e) => { e.stopPropagation(); setAlerts([]); showToast('All alerts cleared', 'success'); setShowNotifications(false); }} className="text-[10px] font-bold text-teal-600 uppercase tracking-widest px-3 py-1 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors">Clear All</button>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {alerts.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No active alerts.</p>
                ) : alerts.map(alert => (
                  <div key={alert.id} className={`flex flex-col gap-2 p-3 rounded-xl border ${alert.type === 'critical' ? 'bg-rose-50 border-rose-100' : 'bg-amber-50 border-amber-100'}`}>
                    <div className="flex gap-3">
                      <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${alert.type === 'critical' ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'}`}></div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-800 leading-tight">{alert.message}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-1">{alert.time}</p>
                      </div>
                    </div>
                    {alert.type === 'critical' && alert.resourceId && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          mockBackend.remediateResource(alert.resourceId);
                          showToast('Initiating AI Self-Healing Protocol...', 'success');
                          setAlerts(prev => prev.filter(a => a.id !== alert.id));
                        }}
                        className="mt-1 text-[10px] font-bold text-white uppercase tracking-widest px-3 py-1.5 bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors text-center w-full shadow-sm"
                      >Execute AI Override</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <Link to="/settings" className="flex items-center gap-4 pl-8 border-l border-slate-200 hover:opacity-80 transition-opacity">
          <div className="text-right">
            <p className="text-sm font-bold text-slate-900 tracking-tight uppercase">{user?.sub || user?.email || 'OFFICER'}</p>
            <div className="flex items-center justify-end gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 bg-teal-500 rounded-full"></span>
              <p className="text-[10px] text-teal-600 font-bold uppercase tracking-widest">Fleet Admiral</p>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl border-2 border-slate-100 p-1 bg-white overflow-hidden shadow-sm hover:border-teal-200 transition-colors">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.sub || 'User'}`} className="w-full h-full rounded-xl" alt="Avatar" />
          </div>
        </Link>
      </div>
    </header>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const token = localStorage.getItem('token');

  if (!isAuthenticated && !token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen">
      <Navigation isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col w-full overflow-hidden">
        <Header />
        <main className="p-10 relative overflow-y-auto">
          <div className="scanline"></div>
          <Routes>
            <Route path="/" element={user?.is_admin ? <AdminDashboard /> : <Dashboard />} />
            <Route path="/resources" element={<ResourceManagement />} />
            <Route path="/tasks" element={<TaskManagement />} />
            <Route path="/ai-chat" element={<AIChat />} />
            <Route path="/data-matrix" element={<DataMatrix />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const GlobalAlertListener = () => {
  const { showToast } = useToast();

  React.useEffect(() => {
    const unsubscribe = mockBackend.subscribe((event) => {
      if (event.type === 'ANOMALY_DETECTED') {
        showToast("CRITICAL BREACH: " + event.data.message, 'error');
      } else if (event.type === 'ANOMALY_RESOLVED') {
        // showToast handled in Header now
      } else if (event.type === 'TASK_UPDATE') {
        // Optional: show task completion toasts but might be noisy.
      }
    });
    return unsubscribe;
  }, [showToast]);

  return null;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <ToastProvider>
          <GlobalAlertListener />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            } />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;
