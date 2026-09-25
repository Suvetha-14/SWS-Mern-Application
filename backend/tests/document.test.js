const request = require('supertest');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const app = require('../app');
const Document = require('../models/Document');

const TEST_DB_URI = process.env.TEST_MONGO_URI || 'mongodb://127.0.0.1:27017/document_management_test';

beforeAll(async () => {
  // Connect to isolated test database
  await mongoose.connect(TEST_DB_URI);
});

afterAll(async () => {
  // Clean up test database collection and close connection
  await Document.deleteMany({});
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  // Clear documents before each test
  await Document.deleteMany({});
});

describe('Document Management API', () => {
  const sampleTxtPath = path.join(__dirname, 'test-file.txt');
  const sampleJsonPath = path.join(__dirname, 'test-file.json');
  const sampleMdPath = path.join(__dirname, 'test-file.md');
  const invalidExtPath = path.join(__dirname, 'test-file.exe');

  beforeAll(() => {
    fs.writeFileSync(sampleTxtPath, 'Acme Corp Annual Paid Leave is 24 days per year.');
    fs.writeFileSync(sampleJsonPath, JSON.stringify({ company: 'Acme Corp', version: '2.0.0' }));
    fs.writeFileSync(sampleMdPath, '# Project Specification\n\nThis is a markdown document.');
    fs.writeFileSync(invalidExtPath, 'fake-binary-content');
  });

  afterAll(() => {
    [sampleTxtPath, sampleJsonPath, sampleMdPath, invalidExtPath].forEach((file) => {
      if (fs.existsSync(file)) fs.unlinkSync(file);
    });
  });

  describe('POST /api/documents/upload', () => {
    it('should successfully upload a .txt document and extract text', async () => {
      const res = await request(app)
        .post('/api/documents/upload')
        .attach('file', sampleTxtPath);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('message');
      expect(res.body.document).toHaveProperty('_id');
      expect(res.body.document.originalName).toBe('test-file.txt');
      expect(res.body.document.fileExtension).toBe('.txt');
      expect(res.body.document.wordCount).toBeGreaterThan(0);

      // Verify persisted in DB
      const inDb = await Document.findById(res.body.document._id);
      expect(inDb).not.toBeNull();
      expect(inDb.extractedText).toContain('Acme Corp Annual Paid Leave is 24 days per year.');
    });

    it('should successfully upload a .json document and format text', async () => {
      const res = await request(app)
        .post('/api/documents/upload')
        .attach('file', sampleJsonPath);

      expect(res.status).toBe(201);
      expect(res.body.document.fileExtension).toBe('.json');
      const inDb = await Document.findById(res.body.document._id);
      expect(inDb.extractedText).toContain('"company": "Acme Corp"');
    });

    it('should successfully upload a .md document', async () => {
      const res = await request(app)
        .post('/api/documents/upload')
        .attach('file', sampleMdPath);

      expect(res.status).toBe(201);
      expect(res.body.document.fileExtension).toBe('.md');
    });

    it('should reject unsupported file types with 400 error', async () => {
      const res = await request(app)
        .post('/api/documents/upload')
        .attach('file', invalidExtPath);

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Unsupported file type');
    });

    it('should return 400 when no file is attached', async () => {
      const res = await request(app).post('/api/documents/upload');

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('No file provided');
    });
  });

  describe('GET /api/documents', () => {
    it('should return an empty list when no documents exist', async () => {
      const res = await request(app).get('/api/documents');

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(0);
      expect(res.body.documents).toEqual([]);
    });

    it('should return documents sorted newest first', async () => {
      // Upload two documents sequentially
      await request(app).post('/api/documents/upload').attach('file', sampleTxtPath);
      await new Promise((r) => setTimeout(r, 50));
      await request(app).post('/api/documents/upload').attach('file', sampleMdPath);

      const res = await request(app).get('/api/documents');

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(2);
      expect(res.body.documents[0].fileExtension).toBe('.md');
      expect(res.body.documents[1].fileExtension).toBe('.txt');
    });
  });

  describe('GET /api/documents/:id', () => {
    it('should return document details including extracted text', async () => {
      const uploadRes = await request(app)
        .post('/api/documents/upload')
        .attach('file', sampleTxtPath);

      const docId = uploadRes.body.document._id;
      const res = await request(app).get(`/api/documents/${docId}`);

      expect(res.status).toBe(200);
      expect(res.body.document._id).toBe(docId);
      expect(res.body.document.extractedText).toContain('Acme Corp');
    });

    it('should return 400 for invalid document ID', async () => {
      const res = await request(app).get('/api/documents/invalid-id-format');
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Invalid document ID format');
    });

    it('should return 404 for non-existent document ID', async () => {
      const randomId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/documents/${randomId}`);
      expect(res.status).toBe(404);
      expect(res.body.error).toContain('not found');
    });
  });

  describe('GET /api/documents/:id/download', () => {
    it('should download original document file', async () => {
      const uploadRes = await request(app)
        .post('/api/documents/upload')
        .attach('file', sampleTxtPath);

      const docId = uploadRes.body.document._id;
      const res = await request(app).get(`/api/documents/${docId}/download`);

      expect(res.status).toBe(200);
      expect(res.headers['content-disposition']).toContain('attachment');
      expect(res.headers['content-disposition']).toContain('test-file.txt');
      expect(res.text).toBe('Acme Corp Annual Paid Leave is 24 days per year.');
    });

    it('should return 400 for invalid document ID', async () => {
      const res = await request(app).get('/api/documents/invalid-id/download');
      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existent document ID', async () => {
      const randomId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/documents/${randomId}/download`);
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/documents/:id', () => {
    it('should delete document metadata and its associated file', async () => {
      const uploadRes = await request(app)
        .post('/api/documents/upload')
        .attach('file', sampleTxtPath);

      const docId = uploadRes.body.document._id;
      const inDbBefore = await Document.findById(docId);
      const filePath = inDbBefore.filePath;
      expect(fs.existsSync(filePath)).toBe(true);

      const deleteRes = await request(app).delete(`/api/documents/${docId}`);
      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.message).toContain('deleted successfully');

      // Verify removed from DB
      const inDbAfter = await Document.findById(docId);
      expect(inDbAfter).toBeNull();

      // Verify removed from disk
      expect(fs.existsSync(filePath)).toBe(false);
    });

    it('should return 400 for invalid document ID', async () => {
      const res = await request(app).delete('/api/documents/bad-id');
      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existent document ID', async () => {
      const randomId = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/api/documents/${randomId}`);
      expect(res.status).toBe(404);
    });
  });
});
