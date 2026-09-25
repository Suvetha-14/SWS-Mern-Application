import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  FileText,
  Copy,
  Check,
  RotateCcw,
  Loader2,
  ExternalLink,
  HelpCircle,
} from 'lucide-react';
import { chatAPI } from '../services/api';

const DEFAULT_SUGGESTIONS = [
  'How many days of annual leave are employees entitled to?',
  'What are the core collaboration hours?',
  'What database is specified in the system architecture?',
  'Summarize the key requirements in the project specification.',
];

export default function ChatInterface({
  documents = [],
  onSelectDocument,
  showToast,
}) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hello! I'm your AI Knowledge Assistant. Ask me anything about your uploaded documents (.txt, .md, .json), and I'll find the relevant facts and cite the source files.",
      sources: [],
      timestamp: new Date(),
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAsking]);

  const handleSend = async (questionToSend) => {
    const q = (questionToSend || inputQuestion).trim();
    if (!q) {
      showToast('Please type a question before sending.', 'warning');
      return;
    }

    if (documents.length === 0) {
      showToast('Please upload at least one document first so I have context to answer.', 'warning');
    }

    const userMessageId = `user-${Date.now()}`;
    const newMessages = [
      ...messages,
      {
        id: userMessageId,
        role: 'user',
        content: q,
        timestamp: new Date(),
      },
    ];

    setMessages(newMessages);
    setInputQuestion('');
    setIsAsking(true);

    try {
      const response = await chatAPI.ask(q);

      const aiMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response.answer || 'No answer generated.',
        sources: response.sources || [],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || err.message || 'Failed to get answer from AI Assistant.';
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ Error: ${errorMsg}`,
          sources: [],
          isError: true,
          timestamp: new Date(),
        },
      ]);
      showToast(errorMsg, 'error');
    } finally {
      setIsAsking(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Answer copied to clipboard', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: `reset-${Date.now()}`,
        role: 'assistant',
        content: "Chat history cleared. What would you like to know about your documents?",
        sources: [],
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[740px] rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md overflow-hidden">
      {/* Chat Header */}
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              AI Document Assistant
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </h2>
            <p className="text-[11px] text-slate-400">
              Retrieval Augmented QA &bull; Powered by document embeddings & text search
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={clearChat}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-400 hover:text-white transition-colors"
          title="Clear Conversation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear Chat</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-[88%] ${
              msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800 text-indigo-400 border border-slate-700'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div
              className={`rounded-2xl p-4 text-xs leading-relaxed transition-all ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/10'
                  : msg.isError
                  ? 'bg-rose-500/10 border border-rose-500/20 text-rose-200 rounded-tl-none'
                  : 'bg-slate-950/70 border border-slate-800/80 text-slate-200 rounded-tl-none shadow-sm'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {/* Source citations badges if available */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 mb-2">
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Cited Sources ({msg.sources.length}):</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.sources.map((source, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => onSelectDocument && onSelectDocument(source._id)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-[11px] text-indigo-300 hover:text-white transition-all group"
                        title="Click to view document content"
                      >
                        <FileText className="w-3 h-3 text-indigo-400" />
                        <span className="font-mono truncate max-w-[150px]">{source.originalName}</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Copy action for assistant responses */}
              {msg.role === 'assistant' && !msg.isError && (
                <div className="mt-2 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => handleCopy(msg.content, msg.id)}
                    className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                    title="Copy Answer"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Thinking indicator */}
        {isAsking && (
          <div className="flex gap-3 max-w-[85%] mr-auto items-center">
            <div className="w-7 h-7 rounded-lg bg-slate-800 text-indigo-400 border border-slate-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div className="rounded-2xl rounded-tl-none p-3 bg-slate-950/70 border border-slate-800 flex items-center gap-2 text-xs text-slate-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              <span>Searching documents and generating response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Pills */}
      {messages.length <= 3 && (
        <div className="px-4 py-2 border-t border-slate-800/60 bg-slate-950/30">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1.5">
            <HelpCircle className="w-3 h-3 text-indigo-400" />
            <span>Suggested Questions:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {DEFAULT_SUGGESTIONS.map((sug, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(sug)}
                disabled={isAsking}
                className="text-[11px] text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 px-2.5 py-1 rounded-lg text-left transition-colors truncate max-w-full disabled:opacity-50"
              >
                &ldquo;{sug}&rdquo;
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your uploaded documents... (e.g., leave days, system specs)"
            disabled={isAsking}
            className="w-full pl-4 pr-12 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isAsking || !inputQuestion.trim()}
            className="absolute right-2 p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 disabled:hover:bg-indigo-600 transition-all shadow-md shadow-indigo-600/30"
            title="Send Question"
          >
            {isAsking ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
        <p className="text-[10px] text-slate-500 mt-2 text-center">
          Answers are synthesized from your uploaded documents with cited source documents.
        </p>
      </div>
    </div>
  );
}
