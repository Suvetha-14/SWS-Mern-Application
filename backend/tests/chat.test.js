const request = require('supertest');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const app = require('../app');
const Document = require('../models/Document');

const TEST_DB_URI = process.env.TEST_MONGO_URI || 'mongodb://127.0.0.1:27017/document_management_test';

beforeAll(async () => {
  await mongoose.connect(TEST_DB_URI);
});

afterAll(async () => {
  await Document.deleteMany({});
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Document.deleteMany({});
});

describe('AI Question Answering API (POST /api/chat/ask)', () => {
  const samplePolicyPath = path.join(__dirname, 'leave-policy.txt');
  const sampleArchPath = path.join(__dirname, 'system-architecture.json');

  beforeAll(() => {
    fs.writeFileSync(
      samplePolicyPath,
      'ACME CORP LEAVE POLICY:\nEmployees are entitled to 24 days of paid annual leave per calendar year. Maternity leave is 26 weeks with full pay.'
    );
    fs.writeFileSync(
      sampleArchPath,
      JSON.stringify({
        database: 'MongoDB 8.0',
        backend: 'Node.js Express',
        frontend: 'React Vite',
        cache: 'Redis 7.0',
      })
    );
  });

  afterAll(() => {
    [samplePolicyPath, sampleArchPath].forEach((file) => {
      if (fs.existsSync(file)) fs.unlinkSync(file);
    });
  });

  it('should return 400 when question is empty', async () => {
    const res = await request(app).post('/api/chat/ask').send({ question: '' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toContain('cannot be empty');
  });

  it('should return 400 when question is whitespace only', async () => {
    const res = await request(app).post('/api/chat/ask').send({ question: '    ' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 400 when question is missing from body', async () => {
    const res = await request(app).post('/api/chat/ask').send({});

    expect(res.status).toBe(400);
  });

  it('should handle question gracefully when no documents are uploaded', async () => {
    const res = await request(app)
      .post('/api/chat/ask')
      .send({ question: 'How much annual leave do I have?' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('answer');
    expect(res.body.answer).toContain('No documents have been uploaded yet');
    expect(res.body.sources).toEqual([]);
  });

  it('should retrieve relevant document and return answer with sources', async () => {
    // Upload leave policy document
    const uploadRes = await request(app)
      .post('/api/documents/upload')
      .attach('file', samplePolicyPath);

    expect(uploadRes.status).toBe(201);
    const uploadedDocId = uploadRes.body.document._id;

    const res = await request(app)
      .post('/api/chat/ask')
      .send({ question: 'How many days of annual leave are employees entitled to?' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('answer');
    expect(typeof res.body.answer).toBe('string');
    expect(res.body.answer.length).toBeGreaterThan(10);
    expect(res.body.answer).toMatch(/24 days/i);

    // Verify sources format
    expect(res.body).toHaveProperty('sources');
    expect(Array.isArray(res.body.sources)).toBe(true);
    expect(res.body.sources.length).toBeGreaterThan(0);
    expect(res.body.sources[0]).toHaveProperty('_id');
    expect(res.body.sources[0]._id).toBe(uploadedDocId);
    expect(res.body.sources[0]).toHaveProperty('originalName');
    expect(res.body.sources[0].originalName).toBe('leave-policy.txt');
  });

  it('should accurately rank and pick the right source among multiple documents', async () => {
    // Upload both leave policy and architecture
    await request(app).post('/api/documents/upload').attach('file', samplePolicyPath);
    const archUpload = await request(app)
      .post('/api/documents/upload')
      .attach('file', sampleArchPath);

    const archId = archUpload.body.document._id;

    const res = await request(app)
      .post('/api/chat/ask')
      .send({ question: 'What database is specified in the architecture?' });

    expect(res.status).toBe(200);
    expect(res.body.sources.length).toBeGreaterThan(0);
    // The top source should be system-architecture.json
    expect(res.body.sources[0]._id).toBe(archId);
    expect(res.body.sources[0].originalName).toBe('system-architecture.json');
    expect(res.body.answer).toMatch(/MongoDB/i);
  });
});
