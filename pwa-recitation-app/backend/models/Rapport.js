const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RapportSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  texte: {
    type: Schema.Types.ObjectId,
    ref: 'Texte',
    required: true,
  },
  recitedText: {
    type: String,
    required: true,
  },
  // Stores the array of differences from the diff algorithm
  diff: {
    type: Array,
    required: true,
  },
  fidelityScore: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Rapport', RapportSchema);
