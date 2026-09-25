import React, { useEffect, useState } from 'react';
import { X, Copy, Check, Download, FileText, Calendar, Hash, Loader2 } from 'lucide-react';
import { documentAPI } from '../services/api';

export default function DocumentPreviewModal({ documentId, onClose, showToast }) {
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!documentId) return;

    let isMounted = true;
    const fetchDoc = async () => {
      try {
        setLoading(true);
        const data = await documentAPI.getById(documentId);
        if (isMounted) {
          setDocument(data.document);
        }
      } catch (err) {
        showToast(err.response?.data?.error || 'Failed to load document content.', 'error');
        if (isMounted) onClose();
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDoc();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      isMounted = false;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [documentId]);

  if (!documentId) return null;

  const handleCopy = () => {
    if (!document?.extractedText) return;
    navigator.clipboard.writeText(document.extractedText);
    setCopied(true);
    showToast('Document text copied to clipboard', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    if (!document) return;
    try {
      await documentAPI.download(document._id, document.originalName);
      showToast(`Downloaded "${document.originalName}"`, 'success');
    } catch (err) {
      showToast('Download failed.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl max-h-[85vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-white truncate max-w-md">
                {document?.originalName || 'Loading document...'}
              </h3>
              {document && (
                <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                  <span className="font-mono uppercase">{document.fileExtension}</span>
                  <span>&bull;</span>
                  <span>{document.wordCount?.toLocaleString() || 0} words</span>
                  <span>&bull;</span>
                  <span>{(document.size / 1024).toFixed(1)} KB</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {document && (
              <>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Copy Extracted Text"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950/20">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 text-xs gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <span>Extracting and rendering document content...</span>
            </div>
          ) : (
            <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap selection:bg-indigo-500 selection:text-white">
              {document?.extractedText || 'No text extracted for this document.'}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>ID: <code className="font-mono text-slate-300">{document?._id}</code></span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
