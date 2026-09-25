import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
  },
});

export const documentAPI = {
  // Upload a document (.txt, .md, .json)
  upload: async (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percentCompleted);
        }
      },
    });
    return response.data;
  },

  // List all uploaded documents
  list: async () => {
    const response = await api.get('/documents');
    return response.data;
  },

  // Get single document details & extracted text
  getById: async (id) => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  // Download document file as attachment
  download: async (id, originalName) => {
    const response = await api.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });

    // Create a temporary link to trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', originalName || 'downloaded-document');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Delete a document
  delete: async (id) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },
};

export const chatAPI = {
  // Ask question about uploaded documents
  ask: async (question) => {
    const response = await api.post('/chat/ask', { question });
    return response.data;
  },
};

export const systemAPI = {
  // Health check
  health: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;
