const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  tags: [{
    type: String
  }],
  image: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: ''
  },
  responsiblePerson: {
    type: String,
    default: ''
  },
  visibility: {
    type: String,
    enum: ['everyone', 'signed_in', 'invitation', 'payment'],
    default: 'everyone'
  },
  price: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  views: {
    type: Number,
    default: 0
  },
  totalDuration: {
    type: Number, // In minutes
    default: 0
  },
  instructorId: {
    type: String, // Storing ID as string to match existing data format, or could use ObjectId if linking directly
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);
