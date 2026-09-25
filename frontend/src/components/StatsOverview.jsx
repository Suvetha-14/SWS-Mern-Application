import React from 'react';
import { Files, FileType, Database, Cpu } from 'lucide-react';

export default function StatsOverview({ documents = [] }) {
  const totalDocs = documents.length;
  const totalWords = documents.reduce((acc, doc) => acc + (doc.wordCount || 0), 0);
  const totalBytes = documents.reduce((acc, doc) => acc + (doc.size || 0), 0);

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const stats = [
    {
      label: 'Total Documents',
      value: totalDocs,
      icon: Files,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
    },
    {
      label: 'Indexed Words',
      value: totalWords.toLocaleString(),
      icon: FileType,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/20',
    },
    {
      label: 'Total Storage',
      value: formatSize(totalBytes),
      icon: Database,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    {
      label: 'Supported Formats',
      value: '.TXT, .MD, .JSON',
      icon: Cpu,
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={index}
            className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm hover:border-slate-700 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">{item.label}</span>
              <div className={`p-2 rounded-lg ${item.bg} border ${item.border}`}>
                <Icon className={`w-4 h-4 ${item.color}`} />
              </div>
            </div>
            <div className="text-xl font-semibold text-white tracking-tight">
              {item.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}
