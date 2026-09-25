# 📄 DocuMind: Enterprise Document Management & AI Assistant

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge&logo=react)](https://github.com/Suvetha-14/SWS-Mern-Application)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.0-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey?style=for-the-badge&logo=express)](https://expressjs.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.0.3-6BA539?style=for-the-badge&logo=swagger)](http://localhost:5000/api-docs)
[![Tests](https://img.shields.io/badge/Tests-22%20Passed-brightgreen?style=for-the-badge&logo=jest)](https://jestjs.io)

A full-stack enterprise document management platform with an AI-powered conversational question-answering assistant. Users can upload, manage, inspect, and download multi-format text documents (`.txt`, `.md`, `.json`), query their document repository in natural language, and receive instant AI answers with verifiable source document citations.

---

## 🌟 Key Features

### 📁 1. Document Management & Ingestion
- **Multi-Format Ingestion**: Supports `.txt`, `.md`, and `.json` documents up to 10MB.
- **Automated Text Extraction**: Normalizes and extracts plain-text, Markdown structure, and JSON key-values on upload.
- **Metadata Persistence**: Tracks word counts, character counts, file sizes, MIME types, and timestamps in MongoDB.
- **Newest-First Listing**: Document dashboard displaying files ordered chronologically.
- **Native Downloads**: Stream original files back to the client with `Content-Disposition: attachment`.
- **Atomic Deletions**: Deletes document metadata from MongoDB and unlinks physical files from storage.
- **Strict Validation**: Guardrails against invalid extensions, empty files, corrupt payloads, and invalid document IDs.

### 🤖 2. AI-Powered Question Answering (RAG)
- **Natural Language Querying**: Ask questions across your entire document repository.
- **Keyword Overlap & BM25 Scoring**: Ranks documents by relevance using query tokenization, stopword removal, and term frequency analysis.
- **Context Synthesis**: Extracts the most salient passages from top-ranked documents.
- **Zero-Dependency Fallback Engine**: Works out-of-the-box without requiring external API keys. Includes optional plug-and-play support for Google Gemini (`GEMINI_API_KEY`) or OpenAI.
- **Source Attribution**: Answers cite the exact source documents (`_id`, `originalName`) used to formulate the response.
- **Interactive Citations**: Click any source citation chip in the chat to open an instant document content preview modal.

### 🎨 3. Modern Pink & White UI Dashboard
- **Pink & White Theme**: Elegant, modern pink and white aesthetic with delicate rose accents, crisp white cards, and high-contrast typography.
- **Live System Metrics**: Real-time counter of total documents, indexed words, and storage footprint.
- **Drag-and-Drop Uploader**: Live file drop zone with validation preview and upload progress indicators.
- **Interactive Chatbot**: Clean conversational UI with suggested prompt starters, copy-to-clipboard, and typing animations.
- **Document Text Modal**: View extracted raw text with copy capabilities and file download triggers.

### 📑 4. Interactive API Documentation
- **Swagger UI**: Interactive OpenAPI 3.0 documentation available at `http://localhost:5000/api-docs`.
- **OpenAPI JSON**: Machine-readable specification served at `http://localhost:5000/api-docs.json`.

### 🧪 5. Automated Test Suite
- Comprehensive integration tests covering all HTTP verbs, status codes (200, 201, 400, 404), validation edge cases, and QA ranking.
- **22/22 Automated Tests Passing**.

---

## 📐 System Architecture & Workflow

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│                 │       │                 │       │                 │
│   React 18 UI   │ ◄───► │ Express 4 Server│ ◄───► │  MongoDB 8.0    │
│  (Tailwind CSS) │  HTTP │  (Node.js 22)   │ Mongoose (Metadata/Text)│
│                 │       │                 │       │                 │
└─────────────────┘       └────────┬────────┘       └─────────────────┘
                                   │
                                   ├── Local Disk Storage (/uploads)
                                   ├── Retrieval Service (BM25 / Overlap)
                                   └── AI Engine (Smart Fallback / Gemini)
```

### End-to-End Workflow:
```
Upload File ──► Multer / Validation ──► Text Extraction ──► Store File & Mongo Metadata
                                                                     │
Ask Question ──► Tokenize & Rank Docs ──► Build Context ──► AI Synthesis ──► Return Answer + Sources
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18+ (tested on Node.js v22.13.1)
- **MongoDB**: v6.0+ (running locally on `mongodb://127.0.0.1:27017` or MongoDB Atlas)

---

### Installation

Clone the repository and install all dependencies:

```bash
git clone https://github.com/Suvetha-14/SWS-Mern-Application.git
cd "Document Management"

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

Or from the project root:
```bash
npm run install:all
```

---

### Environment Configuration

In `backend/.env` (a pre-configured `.env` is provided):

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/document_management
CLIENT_URL=http://localhost:5173
MAX_FILE_SIZE_MB=10

# Optional: Add your Gemini API key to enable cloud LLM generation
GEMINI_API_KEY=
```

---

### Running the Application

#### 1. Start the Backend API:
```bash
cd backend
npm run dev
```
> Server runs at `http://localhost:5000`  
> Interactive Swagger Docs: `http://localhost:5000/api-docs`  
> Health Check: `http://localhost:5000/api/health`

#### 2. Start the Frontend Client:
```bash
cd frontend
npm run dev
```
> Client runs at `http://localhost:5173`

---

## 🧪 Running Automated Tests

Run the complete Jest & Supertest automated test suite:

```bash
cd backend
npm test
```

### Test Coverage Summary:
- ✅ **Document Upload**: `.txt`, `.md`, `.json` ingestion & text extraction.
- ✅ **Document Listing**: Newest-first ordering, metadata projection.
- ✅ **Document Download**: Stream verification and attachment headers.
- ✅ **Document Deletion**: Atomic database removal and disk unlink.
- ✅ **Validation Guardrails**: Unsupported file types, missing uploads, invalid ObjectIds, missing documents.
- ✅ **AI Assistant QA**: Empty query rejection (400), whitespace handling, multi-document ranking, and source citation schema validation.

---

## 📡 API Specification

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/documents/upload` | Upload `.txt`, `.md`, `.json` document (multipart/form-data) |
| `GET` | `/api/documents` | List all uploaded documents (sorted newest first) |
| `GET` | `/api/documents/:id` | Get document details and extracted text |
| `GET` | `/api/documents/:id/download` | Download original uploaded file |
| `DELETE` | `/api/documents/:id` | Delete document metadata and remove local file |
| `POST` | `/api/chat/ask` | Ask AI a question across documents |
| `GET` | `/api/health` | API and service health status |

### Example Chat Request & Response:

**Request (`POST /api/chat/ask`):**
```json
{
  "question": "How many days of annual leave are employees entitled to?"
}
```

**Response (`200 OK`):**
```json
{
  "answer": "Employees are entitled to 24 days of paid annual leave per calendar year. Leave accrues at the rate of 2 days per completed month of service.",
  "sources": [
    {
      "_id": "67451234abcd5678ef901234",
      "originalName": "company_leave_policy.txt"
    }
  ]
}
```

---

## 📂 Sample Documents Included

Sample test documents are included in `/sample-documents`:
1. `company_leave_policy.txt`: Acme Corp employee leave, sick days, and attendance policy.
2. `project_specification.md`: Enterprise Knowledge Management platform architecture specifications.
3. `system_architecture.json`: Infrastructure, microservices, and database configuration specs.

---

## 👩‍💻 Author

**Suvetha**  
GitHub: [@Suvetha-14](https://github.com/Suvetha-14)  
Repository: [SWS-Mern-Application](https://github.com/Suvetha-14/SWS-Mern-Application)
