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
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-pink-500" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-emerald-200 bg-white/95 text-slate-800';
      case 'error':
        return 'border-rose-200 bg-white/95 text-slate-800';
      case 'warning':
        return 'border-amber-200 bg-white/95 text-slate-800';
      case 'info':
      default:
        return 'border-pink-200 bg-white/95 text-slate-800';
    }
  };

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl shadow-pink-500/10 backdrop-blur-md text-xs font-medium max-w-sm animate-in slide-in-from-bottom-5 duration-300 ${getBorderColor()}`}
    >
      {getIcon()}
      <span className="flex-1 leading-snug">{message}</span>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-slate-700 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
