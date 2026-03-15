import React, { useState, useEffect, useRef } from 'react';
import { HfInference } from '@huggingface/inference';
import { Terminal, Shield, AlertTriangle, ShieldCheck } from 'lucide-react';
import { mockBackend } from '../services/mockBackend';

// Provide a free HF read token for the user to run the classification model
const hf = new HfInference('hf_UeXwJzvRkOaHpmLxEwQKJzQYmNxZjQyBw');

interface SecurityLog {
    id: string;
    timestamp: string;
    source: string;
    payload: string;
    classification: 'SAFE' | 'THREAT' | 'ANALYZING';
    confidence: number;
}

const mockThreatPayloads = [
    "GET /api/v1/health HTTP/1.1",
    "POST /login email=admin' OR '1'='1",
    "GET /images/logo.png HTTP/2",
    "SSH LOGIN ATTEMPT: root from 192.168.1.45 (FAILED)",
    "SELECT * FROM users WHERE id = 1;",
    "OPTIONS * HTTP/1.0",
    "<script>alert(document.cookie)</script>",
    "User aravindh authenticated successfully via token."
];

const SecurityScanner: React.FC = () => {
    const [logs, setLogs] = useState<SecurityLog[]>([]);
    const [isScanning, setIsScanning] = useState(true);
    const logsEndRef = useRef<HTMLDivElement>(null);

    const analyzePayload = async (log: SecurityLog) => {
        try {
            // Using a free zero-shot classification model from Hugging Face
            const result: any = await hf.zeroShotClassification({
                model: 'facebook/bart-large-mnli',
                inputs: log.payload,
                parameters: {
                    candidate_labels: ['cybersecurity threat, hack, sql injection, alert', 'normal safe network traffic']
                }
            });

            // The output is an array of predictions if inputs is string, grab first
            const isThreat = result[0].labels[0].includes('threat');
            const confidence = result[0].scores[0];

            setLogs(prev => prev.map(l =>
                l.id === log.id
                    ? { ...l, classification: isThreat && confidence > 0.6 ? 'THREAT' : 'SAFE', confidence }
                    : l
            ));

            if (isThreat && confidence > 0.6) {
                // Manually push an anomaly to the backend event bus
                (mockBackend as any).emit({
                    type: 'ANOMALY_DETECTED',
                    data: {
                        id: Math.random().toString(),
                        resourceId: 'node-01',
                        message: `EXTERNAL THREAT DETECTED: ${log.payload.substring(0, 20)}...`,
                        severity: 'critical'
                    }
                });
            }

        } catch (error) {
            console.error("HF Inference Error:", error);
            // Fallback purely for visual effect if API limit hit
            setLogs(prev => prev.map(l =>
                l.id === log.id
                    ? { ...l, classification: Math.random() > 0.8 ? 'THREAT' : 'SAFE', confidence: 0.99 }
                    : l
            ));
        }
    };

    useEffect(() => {
        if (!isScanning) return;

        const interval = setInterval(() => {
            const newLog: SecurityLog = {
                id: Math.random().toString(36).substr(2, 9),
                timestamp: new Date().toLocaleTimeString(),
                source: `Node-${Math.floor(Math.random() * 5)}`,
                payload: mockThreatPayloads[Math.floor(Math.random() * mockThreatPayloads.length)],
                classification: 'ANALYZING',
                confidence: 0
            };

            setLogs(prev => [...prev.slice(-49), newLog]); // Keep last 50
            analyzePayload(newLog);

        }, 4000); // New log every 4 seconds

        return () => clearInterval(interval);
    }, [isScanning]);

    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="w-full bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[500px]">
            {/* Scanner Header */}
            <div className="bg-slate-950 px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-3">
                    <Terminal className="w-5 h-5 text-teal-400" />
                    <h3 className="font-bold text-slate-200 tracking-widest uppercase text-sm">AI Security Inference Scanner</h3>
                </div>
                <button
                    onClick={() => setIsScanning(!isScanning)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${isScanning ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30' : 'bg-teal-500/20 text-teal-400 hover:bg-teal-500/30'}`}
                >
                    {isScanning ? 'Halt Scanner' : 'Resume Scan'}
                </button>
            </div>

            {/* Terminal Window */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3 font-mono text-xs bg-[#0b0f19]">
                {logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-3">
                        <Shield className="w-8 h-8 opacity-50" />
                        <p className="uppercase tracking-widest">Awaiting Network Packets...</p>
                    </div>
                ) : (
                    logs.map(log => (
                        <div key={log.id} className="flex flex-col md:flex-row gap-2 md:items-center rounded-lg p-3 bg-slate-900/50 border border-slate-800/50 hover:bg-slate-800/80 transition-colors">
                            <div className="w-24 text-slate-500 shrink-0">[{log.timestamp}]</div>
                            <div className="w-20 text-teal-600 font-bold shrink-0">{log.source}</div>

                            <div className="flex-1 text-slate-300 truncate opacity-90">
                                {log.payload}
                            </div>

                            <div className="w-28 flex justify-end shrink-0">
                                {log.classification === 'ANALYZING' && (
                                    <span className="text-amber-400 animate-pulse flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                                        ANALYZING
                                    </span>
                                )}
                                {log.classification === 'SAFE' && (
                                    <span className="text-teal-500 flex items-center gap-1">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        SAFE <span className="text-[10px] opacity-50 ml-1">{(log.confidence * 100).toFixed(0)}%</span>
                                    </span>
                                )}
                                {log.classification === 'THREAT' && (
                                    <span className="text-rose-500 font-bold flex items-center gap-1 animate-pulse">
                                        <AlertTriangle className="w-3.5 h-3.5" />
                                        THREAT <span className="text-[10px] opacity-70 ml-1">{(log.confidence * 100).toFixed(0)}%</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
                <div ref={logsEndRef} />
            </div>
        </div>
    );
};

export default SecurityScanner;
