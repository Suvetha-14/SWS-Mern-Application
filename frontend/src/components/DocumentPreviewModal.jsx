import React, { useEffect, useState } from 'react';
import { X, Copy, Check, Download, FileText, Loader2 } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl max-h-[85vh] bg-white border border-pink-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-pink-100 flex items-center justify-between bg-pink-50/40">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-pink-100 border border-pink-200 text-pink-600 shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-800 truncate max-w-md">
                {document?.originalName || 'Loading document...'}
              </h3>
              {document && (
                <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                  <span className="font-mono uppercase font-semibold text-pink-600 bg-pink-50 px-1.5 py-0.2 rounded border border-pink-200">
                    {document.fileExtension}
                  </span>
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
                  className="p-2 rounded-xl bg-white hover:bg-pink-50 border border-pink-200 text-slate-600 hover:text-pink-600 transition-colors shadow-sm"
                  title="Copy Extracted Text"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="p-2 rounded-xl bg-white hover:bg-rose-50 border border-pink-200 text-slate-600 hover:text-rose-600 transition-colors shadow-sm"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-pink-100 text-slate-400 hover:text-slate-700 transition-colors"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-pink-50/20">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 text-xs gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
              <span>Extracting and rendering document content...</span>
            </div>
          ) : (
            <div className="rounded-xl bg-white border border-pink-100 p-5 font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap selection:bg-pink-500 selection:text-white shadow-sm">
              {document?.extractedText || 'No text extracted for this document.'}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-pink-100 bg-pink-50/40 flex items-center justify-between text-xs text-slate-500">
          <span>ID: <code className="font-mono text-pink-700 font-semibold">{document?._id}</code></span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-semibold shadow-sm transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
