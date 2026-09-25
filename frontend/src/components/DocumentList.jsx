import React, { useState } from 'react';
import {
  FileText,
  Download,
  Trash2,
  Eye,
  Search,
  Calendar,
  Layers,
  FileCode,
  FileJson,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { documentAPI } from '../services/api';

export default function DocumentList({
  documents = [],
  isLoading = false,
  onSelectDocument,
  onDeleteSuccess,
  showToast,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExtension, setSelectedExtension] = useState('all');
  const [deletingId, setDeletingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  // Filter documents by search and extension
  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.originalName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesExt =
      selectedExtension === 'all' || doc.fileExtension?.toLowerCase() === selectedExtension;
    return matchesSearch && matchesExt;
  });

  const formatSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getExtensionBadge = (ext) => {
    switch (ext?.toLowerCase()) {
      case '.json':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
            <FileJson className="w-3 h-3" /> JSON
          </span>
        );
      case '.md':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center gap-1">
            <FileCode className="w-3 h-3" /> MD
          </span>
        );
      case '.txt':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-500/10 text-slate-300 border border-slate-500/20 flex items-center gap-1">
            <FileText className="w-3 h-3" /> TXT
          </span>
        );
    }
  };

  const handleDownload = async (doc) => {
    try {
      setDownloadingId(doc._id);
      await documentAPI.download(doc._id, doc.originalName);
      showToast(`Downloaded "${doc.originalName}"`, 'success');
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to download document.', 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (doc) => {
    const confirm = window.confirm(
      `Are you sure you want to permanently delete "${doc.originalName}" and remove it from knowledge indexing?`
    );
    if (!confirm) return;

    try {
      setDeletingId(doc._id);
      await documentAPI.delete(doc._id);
      showToast(`Deleted "${doc.originalName}"`, 'success');
      if (onDeleteSuccess) {
        onDeleteSuccess(doc._id);
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to delete document.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
      {/* List Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Uploaded Documents
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {documents.length}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Ranked newest first &bull; Ready for AI question answering
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          {['all', '.txt', '.md', '.json'].map((ext) => (
            <button
              key={ext}
              type="button"
              onClick={() => setSelectedExtension(ext)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedExtension === ext
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {ext === 'all' ? 'All' : ext.toUpperCase().replace('.', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search documents by name..."
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      {/* Documents Table / List */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
          <span>Loading indexed documents...</span>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="py-12 px-4 rounded-xl border border-dashed border-slate-800 text-center">
          <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-300">No documents found</p>
          <p className="text-xs text-slate-500 mt-1">
            {searchTerm
              ? 'No documents matched your search term.'
              : 'Upload your first .txt, .md, or .json file to get started.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
          {filteredDocs.map((doc) => (
            <div
              key={doc._id}
              className="p-3 rounded-xl bg-slate-950/50 hover:bg-slate-800/40 border border-slate-800/70 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              {/* Document Info */}
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5">{getExtensionBadge(doc.fileExtension)}</div>
                <div className="min-w-0">
                  <h3
                    onClick={() => onSelectDocument && onSelectDocument(doc._id)}
                    className="text-xs font-semibold text-slate-100 hover:text-indigo-400 cursor-pointer truncate max-w-xs sm:max-w-md transition-colors"
                    title={doc.originalName}
                  >
                    {doc.originalName}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                    <span>{formatSize(doc.size)}</span>
                    <span>&bull;</span>
                    <span>{doc.wordCount?.toLocaleString() || 0} words</span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {formatDate(doc.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 self-end sm:self-auto flex-shrink-0">
                {/* Preview Button */}
                <button
                  type="button"
                  onClick={() => onSelectDocument && onSelectDocument(doc._id)}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-indigo-400 transition-colors"
                  title="View Text Preview"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>

                {/* Download Button */}
                <button
                  type="button"
                  onClick={() => handleDownload(doc)}
                  disabled={downloadingId === doc._id}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-sky-400 transition-colors disabled:opacity-50"
                  title="Download Original File"
                >
                  {downloadingId === doc._id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                </button>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => handleDelete(doc)}
                  disabled={deletingId === doc._id}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-rose-500/20 border border-slate-800 hover:border-rose-500/30 text-slate-300 hover:text-rose-400 transition-colors disabled:opacity-50"
                  title="Delete Document"
                >
                  {deletingId === doc._id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
