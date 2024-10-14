const mongoose = require('mongoose');

const genresSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: false },
    name: { type: String, required: true },
    createdAt: { type: Date, default: new Date() },
    ia: { type: mongoose.Schema.Types.ObjectId, ref: 'ai', required: false }
});

const Genre = mongoose.model('genres', genresSchema);

module.exports = Genre;