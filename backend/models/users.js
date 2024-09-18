const mongoose = require('mongoose');

const userSchema = mongoose.Schema({

    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    google_id: { type: Number, required: false, unique: false, sparse: true /* Permet les valeurs nulles*/ },
    password: {
        type: String,
        required: function () { return !this.google_id; /* Le mot de passe est requis uniquement si google_id n'est pas défini */ },
        default: null
    },
    token: { type: String, required: true },
    prompts: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'projects' }], required: false, default: [] },
    likedprompts: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'projects' }], required: false, default: [] },
    firstname: { type: String, required: true },
    picture: { type: String, required: false, default: null },
    createdAt: { type: Date, default: new Date() },
    genres: [String]
});

const User = mongoose.model('users', userSchema);

module.exports = User;