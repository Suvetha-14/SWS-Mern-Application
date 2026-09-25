import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { documentAPI } from '../services/api';

const ALLOWED_EXTS = ['.txt', '.md', '.json', '.docx', '.pdf'];

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
    <div className="p-5 rounded-2xl bg-white border border-pink-100 shadow-sm shadow-pink-100/40 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-pink-500" />
            Upload Document
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Supported formats:{' '}
            <span className="font-mono font-medium text-pink-600 bg-pink-50 px-1 py-0.5 rounded">.txt</span>,{' '}
            <span className="font-mono font-medium text-pink-600 bg-pink-50 px-1 py-0.5 rounded">.md</span>,{' '}
            <span className="font-mono font-medium text-pink-600 bg-pink-50 px-1 py-0.5 rounded">.json</span>,{' '}
            <span className="font-mono font-medium text-pink-600 bg-pink-50 px-1 py-0.5 rounded">.docx</span>,{' '}
            <span className="font-mono font-medium text-pink-600 bg-pink-50 px-1 py-0.5 rounded">.pdf</span>{' '}
            (Max 10MB)
          </p>
        </div>
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-pink-500 bg-pink-100/50 scale-[0.99]'
            : selectedFile
            ? 'border-rose-400 bg-rose-50/50'
            : 'border-pink-200 hover:border-pink-400 bg-pink-50/20 hover:bg-pink-50/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.json,.docx,.pdf,text/plain,text/markdown,application/json,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />

        {selectedFile ? (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center mb-3 text-rose-600 shadow-sm">
              <FileText className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800 mb-1 truncate max-w-sm">
              {selectedFile.name}
            </p>
            <p className="text-xs text-slate-500 mb-2">
              {(selectedFile.size / 1024).toFixed(1)} KB &bull; Ready to index
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-pink-100 border border-pink-200 flex items-center justify-center mb-3 text-pink-600 shadow-sm">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700 mb-1">
              Drag & drop document here, or{' '}
              <span className="text-pink-600 underline underline-offset-2">browse files</span>
            </p>
            <p className="text-xs text-slate-500">
              Text will be extracted automatically for AI retrieval
            </p>
          </div>
        )}
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Action Buttons & Progress */}
      {selectedFile && (
        <div className="mt-4 flex flex-col gap-3">
          {isUploading && (
            <div className="w-full bg-pink-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-pink-500 to-rose-500 h-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={clearSelection}
              disabled={isUploading}
              className="px-3.5 py-1.5 rounded-xl border border-pink-200 hover:bg-pink-50 text-xs font-medium text-slate-600 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={isUploading}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-xs font-semibold text-white shadow-md shadow-pink-500/25 transition-all disabled:opacity-50"
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
