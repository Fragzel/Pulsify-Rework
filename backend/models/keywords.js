const mongoose = require('mongoose');

const keywordsSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    keyword: { type: String, required: true },
    frequency: { type: Number, required: true, default: 0 },
    average_rating: { type: Number, required: false },
    related_keywords: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'keywords' }], required: false },
    prompts: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'projects' }] },
    genre: { type: String, required: true },
    ia: { type: String, required: false, default: "Suno" }

});

const Keyword = mongoose.model('keywords', keywordsSchema);

module.exports = Keyword;