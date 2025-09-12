const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TexteSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  // Type helps differentiate between a simple text and a structured play
  type: {
    type: String,
    enum: ['individual', 'theatre'],
    default: 'individual',
  },
  // For theatre mode, we can store the structured script here
  structure: {
    type: Schema.Types.Mixed,
    required: false,
  },
  // utilisateurs autorisés à réviser ce texte
  reviewers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Texte', TexteSchema);
