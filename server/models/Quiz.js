const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  id: String,
  text: String,
  isCorrect: Boolean
});

const questionSchema = new mongoose.Schema({
  id: String, // Custom ID support
  text: String,
  type: {
    type: String,
    enum: ['single', 'multiple'],
    default: 'single'
  },
  options: [optionSchema],
  order: Number
});

const quizSchema = new mongoose.Schema({
  courseId: {
    type: String,
    required: true
  },
  lessonId: String, // Optional, if attached to a lesson
  title: {
    type: String,
    required: true
  },
  description: String,
  questions: [questionSchema], // Embedding questions
  passingScore: {
    type: Number,
    default: 70
  },
  maxAttempts: {
    type: Number,
    default: 3
  },
  pointsPerAttempt: {
    type: Number,
    default: 50
  },
  timeLimit: Number // In minutes, optional
}, {
  timestamps: true
});

module.exports = mongoose.model('Quiz', quizSchema);
