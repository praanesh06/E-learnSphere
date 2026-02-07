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
  // Invited users for invitation-only courses
  invitedUsers: [{
    type: String // email addresses
  }],
  price: {
    type: Number,
    default: 0
  },
  // Track users who have paid for the course
  paidUsers: [{
    userId: String,
    paidAt: { type: Date, default: Date.now },
    amount: Number
  }],
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  averageRating: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
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
