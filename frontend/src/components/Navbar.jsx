import React from 'react';
import { FileText, Sparkles, BookOpen, Github, Activity } from 'lucide-react';

export default function Navbar({ isConnected, stats }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight">DocuMind</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
                AI Assistant
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Intelligent Document Management & Neural QA
            </p>
          </div>
        </div>

        {/* Right: Status and Navigation Links */}
        <div className="flex items-center gap-3">
          {/* Connection status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
              }`}
            />
            <span className="text-slate-300 font-medium hidden md:inline">
              {isConnected ? 'API Connected' : 'API Connecting...'}
            </span>
          </div>

          {/* Swagger Docs */}
          <a
            href="http://localhost:5000/api-docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors"
            title="Interactive Swagger OpenAPI Docs"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Swagger API Docs</span>
          </a>

          {/* GitHub Link */}
          <a
            href="https://github.com/Suvetha-14/SWS-Mern-Application"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors"
            title="GitHub Repository"
          >
            <Github className="w-3.5 h-3.5 text-slate-300" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
}
