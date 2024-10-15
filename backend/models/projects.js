const mongoose = require('mongoose');
const express = require('express');

const reportsSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    text: { type: String, requiered: true },
    createdAt: { type: Date, default: new Date() },
});

const projectsSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: false },
    keywords: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'keywords' }], required: false },// a virer
    name: { type: String, required: true },
    createdAt: { type: Date, default: new Date() },
    prompt: { type: String, required: true },
    genre: { type: String, required: true },  // a virer 
    audio: { type: String, required: false },
    rating: { type: Number, required: false },
    isPublic: { type: Boolean, required: true },
    theme: { type: String, required: false },
    reports: [reportsSchema],
    comments: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
        text: { type: String, requiered: true },
        createdAt: { type: Date, default: new Date() },
        reports: [reportsSchema],
    }]
});


const Project = mongoose.model('projects', projectsSchema);

module.exports = Project;

