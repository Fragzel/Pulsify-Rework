const mongoose = require('mongoose');

const signalementsSchema = mongoose.Schema({

  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  text: { type: String, required: true },
  prompt: { type: mongoose.Schema.Types.ObjectId, ref: 'projects', required: false },
  message: {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'projects', required: false },
    comment: {
      comment: { type: String, required: false },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: false }
    }
  },
  createdAt: { type: Date, default: new Date() },


});

const Signalement = mongoose.model('signalements', signalementsSchema);

module.exports = Signalement;