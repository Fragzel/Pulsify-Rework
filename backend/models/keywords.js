const mongoose = require('mongoose');

const keywordsSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    name : { type: String, required: true },
    iterations: { type: Number, required: true, default: 0 },
    average_rating: { type: Number, required: false },
    relatedKeywords: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'keywords' }], required: false },
    genre: { type: String, required: true },
    createdAt : { type: Date, default: new Date() }
});

const Keyword = mongoose.model('keywords', keywordsSchema);

module.exports = Keyword;