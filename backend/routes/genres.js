var express = require('express');
var router = express.Router();
require('../models/connection');
const { checkBody } = require('../modules/tools')
const Project = require('../models/projects');
const Genre = require('../models/genres');
const User = require('../models/users')
const Keyword = require("../models/keywords");



router.post('/allGenres', async (req, res) => {

    // Vérification des éléments requis pour la route
    if (!checkBody(req.body, ['token', 'email'])) {
        res.json({ result: false, error: 'Champs manquants ou vides' });
        return;
    }
    // Authentification de l'utilisateur
    const foundUser = await User.findOne({ email: req.body.email, token: req.body.token })
    if (!foundUser) { return res.json({ result: false, error: 'Access denied' }) };

    // Récupération de tous les genres
    const foundAllGenres = await Genre.find()
    const allGenreNames = foundAllGenres.map(genre => genre.name)
    const genreNames = [...new Set(allGenreNames)]


    res.json(foundAllGenres ? { result: true, allGenres: genreNames } : { result: false, error: 'No genres found' })
})



// Supprimer un genre et tous les mots-clés asscociés
router.post('/removeGenre', async (req, res) => {

    // Vérification des éléments requis pour la route
    if (!checkBody(req.body, ['token', 'email', 'genre'])) {
        res.json({ result: false, error: 'Champs manquants ou vides' });
        return;
    }

    // Authentification de l'utilisateur
    const foundUser = await User.findOne({ email: req.body.email, token: req.body.token })
    if (!foundUser) { return res.json({ result: false, error: 'Access denied' }) };

    const foundProjects = await Project.deleteMany({ userId: foundUser._id, name: req.body.genre })
    const updatedUserGenre = await Genre.updateOne({ _id: foundUser._id, name: req.body.genre }, { userId: "" })
    const keywordGenreList = await Keyword.updateMany({ _id: updatedUserGenre._id, userId: foundUser._id }, { userId: "" })

    if (keywordGenreList && foundProjects && updatedUserGenre) {
        res.json({ result: true, message: 'Successfully deleted' })
    } else {
        res.json({ result: false, error: 'Not found' })
    }
})




module.exports = router;