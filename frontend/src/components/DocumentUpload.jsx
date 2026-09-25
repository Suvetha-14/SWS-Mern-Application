import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';
import { documentAPI } from '../services/api';

const ALLOWED_EXTS = ['.txt', '.md', '.json'];

export default function DocumentUpload({ onUploadSuccess, showToast }) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (!file) return false;
    const name = file.name.toLowerCase();
    const hasValidExt = ALLOWED_EXTS.some((ext) => name.endsWith(ext));

    if (!hasValidExt) {
      setErrorMessage(`Invalid format. Allowed formats: ${ALLOWED_EXTS.join(', ')}`);
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 10MB limit.');
      return false;
    }

    setErrorMessage('');
    return true;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setErrorMessage('');

      const result = await documentAPI.upload(selectedFile, (progress) => {
        setUploadProgress(progress);
      });

      showToast(`Successfully uploaded "${selectedFile.name}"`, 'success');
      setSelectedFile(null);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';

      if (onUploadSuccess) {
        onUploadSuccess(result.document);
      }
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Failed to upload document.';
      setErrorMessage(message);
      showToast(message, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setErrorMessage('');
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-indigo-400" />
            Upload Document
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Supported formats: <span className="font-mono text-slate-300">.txt</span>,{' '}
            <span className="font-mono text-slate-300">.md</span>,{' '}
            <span className="font-mono text-slate-300">.json</span> (Max 10MB)
          </p>
        </div>
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-indigo-500 bg-indigo-500/10'
            : selectedFile
            ? 'border-emerald-500/40 bg-emerald-500/5'
            : 'border-slate-700/80 hover:border-slate-600 bg-slate-950/40 hover:bg-slate-900/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.json,text/plain,text/markdown,application/json"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />

        {selectedFile ? (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3">
              <FileText className="w-6 h-6 text-emerald-400" />
            </div>
            <p className="text-sm font-medium text-white mb-1 truncate max-w-sm">
              {selectedFile.name}
            </p>
            <p className="text-xs text-slate-400 mb-3">
              {(selectedFile.size / 1024).toFixed(1)} KB &bull; Ready to index
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3">
              <UploadCloud className="w-6 h-6 text-indigo-400" />
            </div>
            <p className="text-sm font-medium text-slate-200 mb-1">
              Drag & drop document here, or <span className="text-indigo-400 underline underline-offset-2">browse files</span>
            </p>
            <p className="text-xs text-slate-400">
              Text will be extracted automatically for AI retrieval
            </p>
          </div>
        )}
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="mt-3 flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Action Buttons & Progress */}
      {selectedFile && (
        <div className="mt-4 flex flex-col gap-3">
          {isUploading && (
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-indigo-500 h-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={clearSelection}
              disabled={isUploading}
              className="px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs text-slate-300 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={isUploading}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Uploading {uploadProgress}%...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Upload & Index
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
