const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  id: String,
  name: String,
  url: String,
  type: String,
  size: Number
});

const lessonSchema = new mongoose.Schema({
  courseId: {
    type: String, // String to match existing ID format
    required: true,
    ref: 'Course' // Optional: if we want to use populate later, but IDs might be custom strings
  },
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['video', 'document', 'image', 'quiz'],
    default: 'video'
  },
  description: String,
  content: String, // URL or text content
  duration: {
    type: Number, // In minutes
    default: 0
  },
  attachments: [attachmentSchema],
  order: {
    type: Number,
    default: 0
  },
  allowDownload: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Lesson', lessonSchema);
