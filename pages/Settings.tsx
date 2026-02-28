import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Shield, Key, Bell, ShieldCheck, Mail, Copy, Check } from 'lucide-react';

const Settings: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('profile');

    // Feature state
    const [uiToastEnabled, setUiToastEnabled] = useState(true);
    const [emailDigestEnabled, setEmailDigestEnabled] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText("NEXUS-V4-98A7-B2C1-Q9F3");
        setCopied(true);
        showToast("API Key copied to clipboard", "success");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleToggleUiToast = () => {
        setUiToastEnabled(!uiToastEnabled);
        showToast(uiToastEnabled ? "Live UI Alerts disabled" : "Live UI Alerts enabled", "info");
    };

    const handleToggleEmail = () => {
        setEmailDigestEnabled(!emailDigestEnabled);
        showToast(emailDigestEnabled ? "Daily Digest disabled" : "Daily Digest enabled", "info");
    };

    return (
        <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tighter mb-2">System Preferences</h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Configuration & Access Control</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="col-span-1 space-y-2">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all text-sm font-bold tracking-tight ${activeTab === 'profile'
                            ? 'bg-teal-50 text-teal-700 border border-teal-100 shadow-sm'
                            : 'text-slate-500 hover:bg-white hover:text-slate-800 border border-transparent hover:border-slate-200'
                            }`}
                    >
                        <User className="w-5 h-5" />
                        Operator Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all text-sm font-bold tracking-tight ${activeTab === 'security'
                            ? 'bg-amber-50 text-amber-700 border border-amber-100 shadow-sm'
                            : 'text-slate-500 hover:bg-white hover:text-slate-800 border border-transparent hover:border-slate-200'
                            }`}
                    >
                        <Shield className="w-5 h-5" />
                        Security Tokens
                    </button>
                    <button
                        onClick={() => setActiveTab('notifications')}
                        className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all text-sm font-bold tracking-tight ${activeTab === 'notifications'
                            ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-sm'
                            : 'text-slate-500 hover:bg-white hover:text-slate-800 border border-transparent hover:border-slate-200'
                            }`}
                    >
                        <Bell className="w-5 h-5" />
                        Telemetry Alerts
                    </button>
                </div>

                <div className="col-span-1 md:col-span-3">
                    {activeTab === 'profile' && (
                        <div className="cyber-card p-10 rounded-[2.5rem] bg-white/60">
                            <div className="flex items-start gap-8 border-b border-slate-100 pb-10 mb-10">
                                <div className="w-24 h-24 rounded-3xl border border-slate-200 p-1.5 bg-white shadow-sm shrink-0">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.sub || 'User'}`} className="w-full h-full rounded-2xl bg-slate-50" alt="Avatar" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">Operator Identity</h2>
                                    <p className="text-slate-500 text-sm max-w-lg leading-relaxed">Your assigned operational identity within the Nexus infrastructure. Role modifications require Level 4 authorization.</p>
                                </div>
                            </div>

                            <div className="space-y-6 max-w-2xl">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email / Identifier</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input type="text" disabled value={user?.sub || user?.email || 'N/A'} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm font-medium text-slate-600 opacity-70 cursor-not-allowed" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Clearance Level</label>
                                        <div className="relative">
                                            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                                            <input type="text" disabled value="Fleet Admiral" className="w-full bg-emerald-50/50 border border-emerald-100 rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-emerald-700 cursor-not-allowed" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="cyber-card p-10 rounded-[2.5rem] bg-white/60">
                            <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-6">Security & Authentication</h2>
                            <div className="p-6 border border-amber-200 bg-amber-50/50 rounded-2xl flex items-start gap-4 mb-4">
                                <Key className="w-6 h-6 text-amber-600 shrink-0 mt-1" />
                                <div className="flex-1 w-full">
                                    <h3 className="text-sm font-bold text-slate-800">API Access Key</h3>
                                    <p className="text-xs text-slate-500 mt-1 mb-3 leading-relaxed">Controls backend connectivity to the Gemini models. Managed via `.env.local` configuration on the host server.</p>
                                    <div className="flex items-center gap-2">
                                        <code className="text-[10px] bg-white px-3 py-1.5 rounded-lg border border-amber-100 font-bold tracking-widest text-slate-600">NEXUS-V4-••••-••••-••••</code>
                                        <button
                                            onClick={handleCopy}
                                            className="p-1.5 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors border border-transparent hover:border-amber-200"
                                            title="Copy Key"
                                        >
                                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="cyber-card p-10 rounded-[2.5rem] bg-white/60">
                            <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-6">Notification Protocols</h2>
                            <p className="text-slate-500 text-sm mb-6 max-w-lg leading-relaxed">Configure how you receive critical system alerts and anomalies from the Neural Command Core.</p>

                            <div className="space-y-4">
                                <label className={`flex items-center gap-4 p-5 border rounded-2xl cursor-pointer transition-colors ${uiToastEnabled ? 'border-teal-200 bg-white shadow-sm' : 'border-slate-100 hover:bg-slate-50'}`}>
                                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${uiToastEnabled ? 'bg-teal-600 border-teal-600 text-white' : 'border-slate-300 bg-white'}`}>
                                        {uiToastEnabled && <Check className="w-3.5 h-3.5" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={uiToastEnabled}
                                        onChange={handleToggleUiToast}
                                        className="hidden"
                                    />
                                    <span className="text-sm font-bold text-slate-700">UI Toast Notifications (Live Alerts)</span>
                                </label>
                                <label className={`flex items-center gap-4 p-5 border rounded-2xl cursor-pointer transition-colors ${emailDigestEnabled ? 'border-teal-200 bg-white shadow-sm' : 'border-slate-100 hover:bg-slate-50'}`}>
                                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${emailDigestEnabled ? 'bg-teal-600 border-teal-600 text-white' : 'border-slate-300 bg-white'}`}>
                                        {emailDigestEnabled && <Check className="w-3.5 h-3.5" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={emailDigestEnabled}
                                        onChange={handleToggleEmail}
                                        className="hidden"
                                    />
                                    <span className="text-sm font-bold text-slate-700">Email Daily Digest</span>
                                </label>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
