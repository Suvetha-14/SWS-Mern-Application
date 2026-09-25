import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import StatsOverview from './components/StatsOverview';
import DocumentUpload from './components/DocumentUpload';
import DocumentList from './components/DocumentList';
import DocumentPreviewModal from './components/DocumentPreviewModal';
import ChatInterface from './components/ChatInterface';
import Toast from './components/Toast';
import { documentAPI, systemAPI } from './services/api';

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
  };

  const fetchDocuments = async () => {
    try {
      setLoadingDocs(true);
      const data = await documentAPI.list();
      setDocuments(data.documents || []);
    } catch (err) {
      console.error('Failed to load documents:', err);
      showToast('Could not fetch documents from server.', 'error');
    } finally {
      setLoadingDocs(false);
    }
  };

  const checkHealth = async () => {
    try {
      await systemAPI.health();
      setIsConnected(true);
    } catch (err) {
      setIsConnected(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleUploadSuccess = (newDoc) => {
    setDocuments((prev) => [newDoc, ...prev]);
  };

  const handleDeleteSuccess = (deletedId) => {
    setDocuments((prev) => prev.filter((d) => d._id !== deletedId));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-50/50 via-white to-rose-50/40 text-slate-800">
      {/* Top Navbar */}
      <Navbar isConnected={isConnected} stats={{ count: documents.length }} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Metrics Banner */}
        <StatsOverview documents={documents} />

        {/* 2-Column Responsive Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Document Management (5 cols) */}
          <section className="lg:col-span-5 space-y-6">
            <DocumentUpload
              onUploadSuccess={handleUploadSuccess}
              showToast={showToast}
            />
            <DocumentList
              documents={documents}
              isLoading={loadingDocs}
              onSelectDocument={(id) => setSelectedDocId(id)}
              onDeleteSuccess={handleDeleteSuccess}
              showToast={showToast}
            />
          </section>

          {/* Right Column: AI Assistant Chat Interface (7 cols) */}
          <section className="lg:col-span-7">
            <ChatInterface
              documents={documents}
              onSelectDocument={(id) => setSelectedDocId(id)}
              showToast={showToast}
            />
          </section>
        </div>
      </main>

      {/* Extracted Text Preview Modal */}
      {selectedDocId && (
        <DocumentPreviewModal
          documentId={selectedDocId}
          onClose={() => setSelectedDocId(null)}
          showToast={showToast}
        />
      )}

      {/* Global Toast Notification */}
      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-pink-100 bg-white/70 py-4 text-center text-xs text-slate-500">
        <p>
          DocuMind &bull; Full-Stack MERN Document Management & AI Assistant Platform &bull; OpenAPI 3.0 Enabled
        </p>
      </footer>
    </div>
  );
}
