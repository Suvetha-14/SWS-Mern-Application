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
      color: 'text-pink-600',
      bg: 'bg-pink-50',
      border: 'border-pink-200/60',
    },
    {
      label: 'Indexed Words',
      value: totalWords.toLocaleString(),
      icon: FileType,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-200/60',
    },
    {
      label: 'Total Storage',
      value: formatSize(totalBytes),
      icon: Database,
      color: 'text-fuchsia-600',
      bg: 'bg-fuchsia-50',
      border: 'border-fuchsia-200/60',
    },
    {
      label: 'Supported Formats',
      value: '.TXT, .MD, .JSON',
      icon: Cpu,
      color: 'text-pink-700',
      bg: 'bg-pink-100/60',
      border: 'border-pink-200',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={index}
            className="p-4 rounded-2xl bg-white border border-pink-100/90 shadow-sm shadow-pink-100/40 hover:shadow-md hover:border-pink-200 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">{item.label}</span>
              <div className={`p-2 rounded-xl ${item.bg} border ${item.border}`}>
                <Icon className={`w-4 h-4 ${item.color}`} />
              </div>
            </div>
            <div className="text-xl font-bold text-slate-800 tracking-tight">
              {item.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}
