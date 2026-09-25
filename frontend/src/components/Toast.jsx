import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export default function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-sky-400" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/30 bg-slate-900/95';
      case 'error':
        return 'border-rose-500/30 bg-slate-900/95';
      case 'warning':
        return 'border-amber-500/30 bg-slate-900/95';
      case 'info':
      default:
        return 'border-sky-500/30 bg-slate-900/95';
    }
  };

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md text-xs text-white max-w-sm animate-in slide-in-from-bottom-5 duration-300 ${getBorderColor()}`}
    >
      {getIcon()}
      <span className="flex-1 leading-snug">{message}</span>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-white transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
