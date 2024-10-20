var express = require('express');
var router = express.Router();
require('../models/connection');
const { checkBody } = require('../modules/tools')
const Genre = require('../models/genres')
const User = require('../models/users')
const Project = require('../models/projects')
const Keyword = require('../models/keywords')


router.post("/myGenres", async (req, res) => {
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
        genreMap[genre].titles.push(project.name);
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

router.post("/likedGenres", async (req, res) => {

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
    }).populate('userId', 'firstname picture username').populate('genre');

    // Regroupement des projets par genre et récupération des titres des projets
    let genreMap = {};

    likedProjects.forEach(project => {
        const genre = project.genre.name;
        if (!genreMap[genre]) {
            genreMap[genre] = {
                genre: genre,
                userId: project.userId,
                titles: [],
            };
        }

        // Ajouter le titre du projet à la liste des titres pour ce genre
        genreMap[genre].titles.push(project.name);
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

router.post('/genre', async (req, res) => {

    // Vérification des éléments requis pour la route
    if (!checkBody(req.body, ['genre', 'email', 'token'])) {
        res.json({ result: false, message: 'Champs manquants ou vides' });
        return;
    }

    // Authentification de l'utilisateur
    const foundUser = await User.findOne({ email: req.body.email, token: req.body.token });
    if (!foundUser) {
        return res.json({ result: false, error: 'Access denied' });
    }

    // Recherche par genre en ignorant la casse
    const regexGenre = new RegExp(req.body.genre, "i");

    let pipeline = [
        { $match: { name: regexGenre } },
        { $lookup: { from: 'projects', localField: '_id', foreignField: 'genre', as: 'projects' } },
        { $unwind: '$projects' },
        { $match: { 'projects.isPublic': true } },
        { $lookup: { from: 'users', localField: 'projects.userId', foreignField: '_id', as: 'users' } },
        { $unwind: '$users' },
        {
            $project: {
                _id: '$projects._id',
                audio: '$projects.audio',
                genre: '$name',
                name: '$projects.name',
                prompt: '$projects.prompt',
                rating: '$projects.rating',
                firstname: '$users.firstname',
                username: '$users.username',
                picture: '$users.picture'
            }
        }
    ];

    const projects = await Genre.aggregate(pipeline);

    res.json(projects.length ? { result: true, promptsList: projects } : { result: false, error: 'Genre existant mais non public' });
});

router.post('/keywords', async (req, res) => {

    if (!checkBody(req.body, ['keyword', 'email', "token"])) {
        res.json({ result: false, error: 'Champs vides ou manquants' });
        return;
    }

    const formattedRegex = new RegExp(req.body.keyword, "i");
    const foundProjects = await Project.find({ prompt: formattedRegex }).populate("genre", "name").populate("userId", "firstname username picture")

    listIds = foundProjects.map(project => project._id)

    let projects = foundProjects.map((project) =>
        listIds.includes(project._id) &&
        ({
            _id: project._id,
            audio: project.audio,
            genre: project.genre.name,
            name: project.name,
            prompt: project.prompt,
            rating: project.rating,
            firstname: project.userId.firstname,
            username: project.userId.username,
            picture: project.userId.picture
        })
    )

    if (projects.length) {
        res.json({ result: true, keywordsList: projects })
    } else {
        res.json({ result: false, error: 'Mot clé existant mais projet associé non public' })
    }

});

router.post('/title', async (req, res) => {

    // Vérification des éléments requis pour la route
    if (!checkBody(req.body, ['title', 'email', "token"])) {
        res.json({ result: false, error: 'Champs manquants ou vides' });
        return;
    }

    // Authentification de l'utilisateur
    const foundUser = await User.findOne({ email: req.body.email, token: req.body.token });
    if (!foundUser) {
        res.json({ result: false, error: 'Access denied' });
        return;
    }

    // Recherche par titre en ignorant la casse
    const foundProjects = await Project.find({ name: { $regex: new RegExp(req.body.title, "i") } })
        .populate("genre", "name")
        .populate("userId", "firstname username picture");

    if (foundProjects.length) {
        const projectList = foundProjects.map(project => ({
            _id: project._id,
            audio: project.audio,
            genre: project.genre.name,
            name: project.name,
            prompt: project.prompt,
            rating: project.rating,
            firstname: project.userId.firstname,
            username: project.userId.username,
            picture: project.userId.picture
        }));

        res.json({ result: true, projectList: projectList });
    } else {
        res.json({ result: false, error: 'Projet non existant' });
    }
});

router.post('/users', async (req, res) => {

    // Vérifier que les champs sont tous fournis
    if (!checkBody(req.body, ['username', 'token', 'email'])) {
        res.json({ result: false, error: 'Champs vides ou manquants' });
        return;
    }

    // Authentification de l'utilisateur
    const foundUser = await User.findOne({ email: req.body.email, token: req.body.token })
    if (!foundUser) { return res.json({ result: false, error: 'Access denied' }) };

    const fetchAllUser = await User.find({ username: { $regex: new RegExp(req.body.username, "i") } })
    if (fetchAllUser.length) {

        // Récupérer les projets publics de l'utilisateur

        const userProjects = await Project.find({ userId: { $in: fetchAllUser } }).populate('userId', 'firstname picture username').populate('genre', 'name')
        const projectList = []
        for (const project of userProjects) {
            project.isPublic && projectList.push({
                _id: project._id,
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


        if (projectList.length) {
            res.json({ result: true, projectList: projectList });
        } else {
            res.json({ result: false, error: "Cet auteur n'a aucun projet" });
        }

    } else {
        res.json({ result: false, error: 'Utilisateur introuvable' })
    }
})

module.exports = router;