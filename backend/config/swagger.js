const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Document Management & AI Assistant API',
      version: '1.0.0',
      description:
        'RESTful API for uploading, managing, downloading, and querying documents with an AI-powered assistant.',
      contact: {
        name: 'API Support',
        email: 'suvetha7300@gmail.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local Development Server',
      },
    ],
    components: {
      schemas: {
        DocumentMetadata: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '65f1234567890abcdef12345' },
            originalName: { type: 'string', example: 'company_leave_policy.txt' },
            fileName: { type: 'string', example: 'company_leave_policy-1711234567-123456.txt' },
            mimeType: { type: 'string', example: 'text/plain' },
            fileExtension: { type: 'string', example: '.txt' },
            size: { type: 'integer', example: 1420 },
            wordCount: { type: 'integer', example: 210 },
            characterCount: { type: 'integer', example: 1420 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        DocumentDetail: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '65f1234567890abcdef12345' },
            originalName: { type: 'string', example: 'company_leave_policy.txt' },
            fileName: { type: 'string', example: 'company_leave_policy-1711234567-123456.txt' },
            filePath: { type: 'string', example: '/app/uploads/company_leave_policy.txt' },
            mimeType: { type: 'string', example: 'text/plain' },
            fileExtension: { type: 'string', example: '.txt' },
            size: { type: 'integer', example: 1420 },
            extractedText: { type: 'string', example: 'ACME CORP - EMPLOYEE LEAVE POLICY...' },
            wordCount: { type: 'integer', example: 210 },
            characterCount: { type: 'integer', example: 1420 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        UploadResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Document uploaded and indexed successfully.' },
            document: { $ref: '#/components/schemas/DocumentMetadata' },
          },
        },
        DocumentListResponse: {
          type: 'object',
          properties: {
            count: { type: 'integer', example: 3 },
            documents: {
              type: 'array',
              items: { $ref: '#/components/schemas/DocumentMetadata' },
            },
          },
        },
        ChatRequest: {
          type: 'object',
          required: ['question'],
          properties: {
            question: {
              type: 'string',
              description: 'The question to ask across uploaded documents',
              example: 'How many days of annual leave are employees entitled to?',
            },
          },
        },
        ChatSource: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '65f1234567890abcdef12345' },
            originalName: { type: 'string', example: 'company_leave_policy.txt' },
          },
        },
        ChatResponse: {
          type: 'object',
          properties: {
            answer: {
              type: 'string',
              example: 'Employees are entitled to 24 days of paid annual leave per calendar year.',
            },
            sources: {
              type: 'array',
              items: { $ref: '#/components/schemas/ChatSource' },
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Question is required and cannot be empty.' },
            status: { type: 'integer', example: 400 },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js', './controllers/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
