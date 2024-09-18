const mongoose = require('mongoose');

const projectsSchema = mongoose.Schema({
    prompt: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: false },
    keywords: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'keywords' }], required: false },
    title: { type: String, required: true },
    genre: { type: String, required: true },
    messages: [{
        comment: { type: String, required: false },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: false },
        createdAt: { type: Date, required: false, default: new Date() },
        nbSignalements: { type: Number, required: false, default: 0 },
    }],
    theme: { type: String, required: false },
    audio: { type: String, required: false },
    nbLikes: { type: Number, required: false },
    rating: { type: Number, required: false },
    isPublic: { type: Boolean, required: true },
    nbSignalements: { type: Number, required: false, default: 0 },
    createdAt: { type: Date, default: new Date() },
    ia: { type: String, required: false, default: "Suno" }
});

const Project = mongoose.model('projects', projectsSchema);

module.exports = Project;