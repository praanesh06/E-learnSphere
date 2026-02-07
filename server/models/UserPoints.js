const mongoose = require('mongoose');

const userPointsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  badges: [{
    type: String // Badge IDs
  }],
  streakDays: {
    type: Number,
    default: 0
  },
  coursesCompleted: {
    type: Number,
    default: 0
  },
  quizzesPassed: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('UserPoints', userPointsSchema);
