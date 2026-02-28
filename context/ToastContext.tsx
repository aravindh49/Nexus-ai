import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AlertOctagon, Info, CheckCircle2, X } from 'lucide-react';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = (message: string, type: ToastType = 'info') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto remove after 5s
        setTimeout(() => {
            removeToast(id);
        }, 5000);
    };

    const removeToast = (id: number) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    const getIcon = (type: ToastType) => {
        switch (type) {
            case 'error': return <AlertOctagon className="w-5 h-5 text-rose-500" />;
            case 'warning': return <AlertOctagon className="w-5 h-5 text-amber-500" />;
            case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
            default: return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    const getStyle = (type: ToastType) => {
        switch (type) {
            case 'error': return 'bg-rose-50 border-rose-200 text-rose-800 shadow-rose-500/10';
            case 'warning': return 'bg-amber-50 border-amber-200 text-amber-800 shadow-amber-500/10';
            case 'success': return 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-emerald-500/10';
            default: return 'bg-blue-50 border-blue-200 text-blue-800 shadow-blue-500/10';
        }
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`flex items-start gap-3 p-4 border rounded-2xl shadow-xl animate-in slide-in-from-right-8 fade-in duration-300 min-w-[320px] max-w-sm ${getStyle(toast.type)}`}
                    >
                        <div className="shrink-0 mt-0.5">{getIcon(toast.type)}</div>
                        <div className="flex-1">
                            <p className="text-sm font-bold tracking-tight">{toast.message}</p>
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
