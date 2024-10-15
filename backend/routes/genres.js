var express = require('express');
var router = express.Router();
require('../models/connection');
const { checkBody } = require('../modules/tools')
const Project = require('../models/projects');
const Genre = require('../models/genres');
const User = require('../models/users')
const Keyword = require("../models/keywords");


router.post("/searchMyGenres", async (req, res) => {
    // Vérification des éléments requis pour la route
    if (!checkBody(req.body, ['email', 'token'])) {
        res.json({ result: false, message: 'Champs manquants ou vides' });
        return;
    }

    // Authentification de l'utilisateur
    const foundUser = await User.findOne({ email: req.body.email, token: req.body.token });
    if (!foundUser) {
        return res.json({ result: false, error: 'Access denied' });
    }

    // Formattage du champ de recherche
    let formattedSearch = req.body.search ? req.body.search.trim() : '';
    if (formattedSearch) {
        formattedSearch = formattedSearch[formattedSearch.length - 1] === "," ? formattedSearch.slice(0, -1) : formattedSearch;
        formattedSearch = formattedSearch[0] === "," ? formattedSearch.slice(1) : formattedSearch;
    }

    // Recherche des ids des genres de l'utilisateur correspondant à la recherche
    const foundGenres = await Genre.find({ userId: foundUser._id, name: { $regex: new RegExp(formattedSearch, 'i') } });
    const genreIds = foundGenres.map(genre => genre._id);

    // Récupération des projets correspondant à l'utilisateur et au critère de recherche
    let projects = await Project.find({
        userId: foundUser._id,
        ...(formattedSearch && {
            $or: [
                { genre: { $in: genreIds } },
                { title: { $regex: new RegExp(formattedSearch, 'i') } }
            ]
        })
    }).populate('genre').populate('userId', 'firstname picture');

    // Regroupement des projets par genre et récupération des titres des projets
    let genreMap = {};

    projects.forEach(project => {
        console.log(project)
        const genre = project.genre.name;
        // Cette condition pour éviter les doublons quand on liste les genres
        if (!genreMap[genre]) {
            genreMap[genre] = {
                genre: genre,
                userId: project.userId,
                titles: [],
            };
        }

        // Ajouter le titre du projet à la liste des titres pour ce genre
        genreMap[genre].titles.push(project.title);
    });

    // Conversion de genreMap en tableau
    let genresList = Object.values(genreMap).map(genreItem => {
        const { genre, userId, titles } = genreItem;
        return {
            genre: genre,
            userId: userId,
            titles: titles.join(', ')
        };
    });

    res.json({ result: true, searchResults: genresList });
});







router.post("/searchLikedGenres", async (req, res) => {

    // Vérification des éléments requis pour la route
    if (!checkBody(req.body, ['email', 'token'])) {
        res.json({ result: false, message: 'Champs manquants ou vides' });
        return;
    }

    // Authentification de l'utilisateur
    const foundUser = await User.findOne({ email: req.body.email, token: req.body.token });
    if (!foundUser) {
        return res.json({ result: false, error: 'Access denied' });
    }

    // Formattage du champ de recherche
    let formattedSearch = req.body.search ? req.body.search.trim() : '';
    if (formattedSearch) {
        formattedSearch = formattedSearch[formattedSearch.length - 1] === "," ? formattedSearch.slice(0, -1) : formattedSearch;
        formattedSearch = formattedSearch[0] === "," ? formattedSearch.slice(1) : formattedSearch;
    }

    // Récupération des projets que l'utilisateur a liké et qui sont publics
    let likedProjects = await Project.find({
        _id: { $in: foundUser.likedProjects },
        isPublic: true,
        ...(formattedSearch && {
            $or: [
                { genre: { $regex: new RegExp(formattedSearch, 'i') } },
                { title: { $regex: new RegExp(formattedSearch, 'i') } }
            ]
        })
    }).populate('userId', 'firstname picture username');

    // Regroupement des projets par genre et récupération des titres des projets
    let genreMap = {};

    likedProjects.forEach(project => {
        const genre = project.genre;
        if (!genreMap[genre]) {
            genreMap[genre] = {
                genre: genre,
                userId: project.userId,
                titles: [],
            };
        }

        // Ajouter le titre du projet à la liste des titres pour ce genre
        genreMap[genre].titles.push(project.title);
    });

    // Conversion de genreMap en tableau
    let genresList = Object.values(genreMap).map(genreItem => {
        const { genre, userId, titles } = genreItem;
        return {
            genre: genre,
            userId: userId,
            titles: titles.join(', ')
        };
    });

    res.json({ result: true, searchResults: genresList });
});





router.post('/searchGenre', async (req, res) => {

    // Authentification de l'utilisateur
    if (!checkBody(req.body, ['genre', 'email', 'token'])) {
        res.json({ result: false });
        return;
    }

    // Authentification de l'utilisateur
    const foundUser = await User.findOne({ email: req.body.email, token: req.body.token })
    if (!foundUser) { return res.json({ result: false, error: 'Access denied' }) };

    // Recherche par genre en ignorant la casse
    const foundGenre = await Genre.findOne({ name: { $regex: new RegExp(req.body.genre, "i") } })
    const fetchedProjects = await Project.find({ genre: foundGenre ? foundGenre._id : null })

    if (fetchedProjects.length) {
        
    const projects = []
    const populatedProjects = await Project.find({ genre: foundGenre }).populate({
        path: 'userId',
        select: 'firstname picture username'
    }).populate({
        path: 'genre',
        select: 'name'
    });
    
    for (const project of populatedProjects) {
        project.isPublic && projects.push({  
            audio: project.audio,
            genre: project.genre.name,
            name: project.name,
            prompt: project.prompt,
            rating: project.rating,
            firstname: project.userId.firstname,
            username: project.userId.username,
            picture: project.userId.picture
        })
    }
    res.json(projects.length ? { result: true, promptsList: projects } : { result: false, error: 'Genre existant mais non public' });
    } else {
        res.json({ result: false, error: 'Genre non existant' })
    }
});


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
    const genreNames = foundAllGenres.map(genre => genre.name)  
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