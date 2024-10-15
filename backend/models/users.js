const mongoose = require('mongoose');

const userSchema = mongoose.Schema({

    username: { type: String, required: true },
    firstname: { type: String, required: true },
    createdAt: { type: Date, default: new Date() },
    email: { type: String, required: true, unique: true },
    google_id: { type: Number, required: false, unique: false, sparse: true /* Permet les valeurs nulles*/ },
    password: {
        type: String,
        required: function () { return !this.google_id; /* Le mot de passe est requis uniquement si google_id n'est pas défini */ },
        default: null
    },
    token: { type: String, required: true },
    likedProjects: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'projects' }], required: false, default: [] },
    picture: { type: String, required: false, default: null },
    theme: { type: String, required: false },
    language: { type: String, required: false },
 
});

const User = mongoose.model('users', userSchema);

module.exports = User;