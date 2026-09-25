const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: [true, 'Original filename is required'],
      trim: true,
    },
    fileName: {
      type: String,
      required: [true, 'Stored filename is required'],
      unique: true,
    },
    filePath: {
      type: String,
      required: [true, 'File path is required'],
    },
    mimeType: {
      type: String,
      required: [true, 'MIME type is required'],
    },
    fileExtension: {
      type: String,
      required: [true, 'File extension is required'],
      lowercase: true,
    },
    size: {
      type: Number,
      required: [true, 'File size is required'],
    },
    extractedText: {
      type: String,
      default: '',
    },
    characterCount: {
      type: Number,
      default: 0,
    },
    wordCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for full-text search capability
documentSchema.index({ originalName: 'text', extractedText: 'text' });

module.exports = mongoose.model('Document', documentSchema);
