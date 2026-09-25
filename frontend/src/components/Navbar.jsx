import React from 'react';
import { Sparkles, BookOpen, Github } from 'lucide-react';

export default function Navbar({ isConnected, stats }) {
  return (
    <header className="sticky top-0 z-40 border-b border-pink-100 bg-white/90 backdrop-blur-md shadow-sm shadow-pink-100/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-fuchsia-400 flex items-center justify-center shadow-md shadow-pink-500/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">DocuMind</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-100/70 text-pink-700 border border-pink-200 font-semibold">
                AI Assistant
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Intelligent Document Management & Neural QA
            </p>
          </div>
        </div>

        {/* Right: Status and Navigation Links */}
        <div className="flex items-center gap-3">
          {/* Connection status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-pink-50/60 border border-pink-100 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-400'
              }`}
            />
            <span className="text-slate-700 font-medium hidden md:inline">
              {isConnected ? 'API Connected' : 'API Connecting...'}
            </span>
          </div>

          {/* Swagger Docs */}
          <a
            href="http://localhost:5000/api-docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-pink-50 border border-pink-200/80 text-xs font-medium text-slate-700 hover:text-pink-600 transition-all shadow-sm"
            title="Interactive Swagger OpenAPI Docs"
          >
            <BookOpen className="w-3.5 h-3.5 text-pink-500" />
            <span className="hidden sm:inline">Swagger API Docs</span>
          </a>

          {/* GitHub Link */}
          <a
            href="https://github.com/Suvetha-14/SWS-Mern-Application"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-pink-50 border border-pink-200/80 text-xs font-medium text-slate-700 hover:text-pink-600 transition-all shadow-sm"
            title="GitHub Repository"
          >
            <Github className="w-3.5 h-3.5 text-slate-600 group-hover:text-pink-600" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
}
