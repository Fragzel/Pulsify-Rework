const mongoose = require('mongoose');

const aiSchema = mongoose.Schema({
    name: { type: String, required: true },
    iaType: { type: String, required: true }
});

const Ai = mongoose.model('ai', aiSchema);

module.exports = Ai;