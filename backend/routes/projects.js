var express = require('express');
var router = express.Router();
require('../models/connection');
const { checkBody } = require('../modules/tools')
const Project = require('../models/projects');
const User = require('../models/users')
const Keyword = require("../models/keywords")
const Signalement = require("../models/signalements")
const cloudinary = require('../cloudinary');

// Middelware pour décoder les données de l'audio venant du frontend
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Route pour ajouter un projet en BDD
router.post("/add", async (req, res) => {

    // Vérification des éléments requis pour la route
    if (!checkBody(req.body, ['genre', 'prompt', 'email', "username", "rating", "title"])) {
        res.json({ result: false, error: 'Champs manquants ou vides' });
        return;
    }
    // Authentification de l'utilisateur
    const foundUser = await User.findOne({ email: req.body.email, token: req.body.token })
    !foundUser && res.json({ result: false, error: 'Access denied' });

    // Enregistrer en base de donnée le Prompt, sans les espaces à la fin et au début, et sans la virgule à la fin, et sans l'audio, même s'il y en a un
    const trimmedPrompt = req.body.prompt.trim();
    const formattedPrompt = trimmedPrompt[trimmedPrompt.length - 1] === "," ? trimmedPrompt.slice(0, -1) : trimmedPrompt;

    const newProject = new Project({
        genre: req.body.genre, // a mettre dans la collec genres 
        prompt: formattedPrompt,
        audio: "",
        rating: req.body.rating,
        isPublic: req.body.isPublic,
        username: req.body.username,
        email: req.body.email,
        userId: foundUser._id,
        name: req.body.name
    });

    const savedProject = await newProject.save();


    // Mettre à jour le tableau de clé étrangère "prompts" avec l'id du prompt et le tableau genre si le genre n'y est pas déjà 
    await User.updateOne({ email: req.body.email },
        { $push: { prompts: savedProject._id } });

    if (!foundUser.genres.some(e => e === req.body.genre)) {
        await User.updateOne({ email: req.body.email },
            { $push: { genres: req.body.genre } }
        );
    }

    // Récupérer les keywords de manière formatée 
    const keywords = []; //liste des Keywords et formaté du prompt . 

    const splittedKeywords = formattedPrompt.split(',');

    for (const word of splittedKeywords) {
        const trimmedWord = word.trim();
        if (trimmedWord) {
            keywords.push(trimmedWord.charAt(0).toUpperCase() + trimmedWord.slice(1));
        }
    }

    // Créer un tableau des id présents en clé étrangère pour le keyword s'il n'existe pas. S'il existe, on rajoute les keywords dans ses relatedKeywords.
    const existingKeywordIds = [];
    const newKeywordIds = [];

    for (const word of keywords) {
        const foundKeyword = await Keyword.findOne({ name: word, userId: foundUser._id, genre: req.body.genre });
        if (foundKeyword) {
            existingKeywordIds.push(foundKeyword._id);
        } else {
            const newKeyword = new Keyword({
                userId: foundUser._id,
                name: word,
                iterations: 1,
                average_rating: req.body.rating,
                prompts: savedProject._id,
                genre: req.body.genre
            });
            const savedKeyword = await newKeyword.save();
            newKeywordIds.push(savedKeyword._id);
        }
    }
    const mergedKeywordIds = [...newKeywordIds, ...existingKeywordIds];
    await Project.updateOne({ _id: savedProject._id },
        { keywords: mergedKeywordIds }
    );

    // Si l'id n'est pas présent dans les relatedKeywords, on le rajoute
    if (newKeywordIds.length) {
        const keywordsData = await Keyword.find({ _id: { $in: newKeywordIds } });

        for (const keywordData of keywordsData) {
            const { _id, name } = keywordData;

            const filteredKeywordIds = keywords.filter(e => e === name).length > 1
                ? newKeywordIds
                : newKeywordIds.filter(e => e !== _id.toString());

            const allKeywordsIdsOfThisGenre = [...filteredKeywordIds, ...existingKeywordIds];

            await Keyword.updateOne({ _id, genre: req.body.genre }, {
                $push: { relatedKeywords: allKeywordsIdsOfThisGenre }
            });
        }
    }

    // Si il y a déjà des relatedKeywords pour ce projet, ajoute ceux qui n'y sont pas déjà.
    if (existingKeywordIds.length) {
        for (const id of existingKeywordIds) {
            // const keyword = await Keyword.findById(id);
            const keyword = await Keyword.findById(id).populate('prompts');
            const kewordIdsToAdd = [];
            for (let i = 0; i < newKeywordIds.length; i++) {
                if (!keyword.relatedKeywords.some(e => String(e) === String(newKeywordIds[i]))) {
                    kewordIdsToAdd.push(newKeywordIds[i]);
                }
            }
            const updateRelatedKeywordId = [...keyword.relatedKeywords, ...kewordIdsToAdd];

            let resultAverageRating = 0;
            const promptKeywordsCount = (keyword.prompts).length;
            for (const prompt of keyword.prompts) {
                resultAverageRating += prompt.rating;
            }
            if (!keyword.prompts.some(e => String(e) === String(savedProject._id))) {
                await Keyword.updateOne({ _id: id }, {
                    $inc: { iterations: 1 },
                    relatedKeywords: updateRelatedKeywordId,
                    $push: { prompts: savedProject._id },
                    average_rating: resultAverageRating / promptKeywordsCount
                });
            } else {
                await Keyword.updateOne({ _id: id }, {
                    $inc: { iterations: 1 },
                    relatedKeywords: updateRelatedKeywordId,
                    average_rating: resultAverageRating / promptKeywordsCount
                });
            }
        }
    }

    res.json({ result: true, prompt: savedProject });
})

// Route pour télécharger l'audio sur Cloudinary et récupérer le lien
router.post("/:projectId/upload-audio", upload.single('audio'), async (req, res) => {

    const projectId = req.params.projectId;
    // Recherche dans la Bdd le projet pour lequel il faut rajouter l'audio
    const project = await Project.findById(projectId);
    if (!project) {
        return res.status(404).json({ result: false, message: "Project not found" });
    }
    // Ouverture du flux de données pour envoyer l'audio a Cloudinary
    cloudinary.uploader.upload_stream(
        { resource_type: 'video', folder: 'audios' },
        async (error, result) => {
            if (error) {
                return res.status(500).json({ message: 'Upload failed', error });
            }

            // Mise à jour du projet pour ajouter l'audio
            project.audio = result.secure_url;
            await project.save();

            res.json({ result: true, message: 'Audio uploaded successfully', url: result.secure_url });
        }
        // Fermeture du flux de données 
    ).end(req.file.buffer);

});


// Recherche par titre
router.post('/searchTitle', async (req, res) => {

    // Vérification des éléments requis pour la route
    if (!checkBody(req.body, ['title', 'email', "token"])) {
        res.json({ result: false, error: 'Champs manquants ou vides' });
        return;
    }

    // Authentification de l'utilisateur
    const foundUser = await User.findOne({ email: req.body.email, token: req.body.token });
    !foundUser && res.json({ result: false, error: 'Access denied' });

    // Recherche par titre en ignorant la casse
    const projects = await Project.find({ title: { $regex: new RegExp(req.body.title, "i") } });
    if (projects.length) {
        const prompts = []
        for (const populateUserId of projects) {
            const userIdPopulatedInPrompt = await populateUserId.populate('userId');
            userIdPopulatedInPrompt.isPublic && prompts.push(userIdPopulatedInPrompt);
        }
        if (prompts.length) {
            res.json({ result: true, promptsList: prompts });
        } else {
            res.json({ result: false, error: 'Projet existant mais non public' });
        }
    } else {
        res.json({ result: false, error: 'Projet non existant' });
    }
})


// Suppression d'un prompt
router.delete("/prompt", async (req, res) => {

    // Vérification des éléments requis pour la route
    if (!checkBody(req.body, ['id', 'email', "token"])) {
        res.json({ result: false, error: 'Champs manquants ou vides' });
        return;
    }
    // Authentification de l'utilisateur
    const foundUser = await User.findOne({ email: req.body.email, token: req.body.token });
    !foundUser && res.json({ result: false, error: 'Access denied' });

    // Suppression du prompt
    const { id } = req.body;
    await Project.deleteOne({ _id: id })
        .then(async deletedDoc => {
            if (deletedDoc.deletedCount > 0) {
                await User.updateOne({ email: req.body.email }, { $pull: { prompts: req.body.id } });
                await Keyword.updateMany({ userId: foundUser._id }, { $pull: { prompts: req.body.id } });
                await Signalement.deleteMany({ prompt: req.body.id });
                res.json({ result: true });
            } else {
                res.json({ result: false });
            }
        })
})




// Enregistrer un signalement d'un projet
router.post('/signalementProject', async (req, res) => {

    // Vérification des éléments requis pour la route
    if (!checkBody(req.body, ['idPrompt', 'text', 'email', "token"])) {
        res.json({ result: false, error: 'Champs manquants ou vides' });
        return;
    }
    // Authentification de l'utilisateur
    const foundUser = await User.findOne({ email: req.body.email, token: req.body.token });
    !foundUser && res.json({ result: false, error: 'Access denied' });

    const foundProject = await Project.findById(req.body.idPrompt);
    if (foundProject) {
        try {
            const projectId = req.body.idPrompt;
            const project = await Project.findByIdAndUpdate(
                projectId,
                { $push: {reports : {  userId: foundUser._id, text: req.body.text } } }
            );
            if (!project) {
                return res.json({ result: false, error: 'Aucun projet correspondant à mettre à jour' });
            }
            res.json({ result: true });
        } catch (error) {
            res.json({ result: error });
        }
    }
});

// Enregistrement un signalement d'un commentaire
router.post('/signalementComment', async (req, res) => {

    // Vérification des éléments requis pour la route
    if (!checkBody(req.body, ['idProject', 'text', 'email', "token"])) {
        res.json({ result: false, error: 'Champs manquants ou vides' });
        return;
    }
    // Authentification de l'utilisateur
    const foundUser = await User.findOne({ email: req.body.email, token: req.body.token });
    !foundUser && res.json({ result: false, error: 'Access denied' });
  
        try {
            const project = await Project.findByIdAndUpdate(
                req.body.idPrompt,
                { $push: { comments : {reports : {  userId: foundUser._id, text: req.body.text } } } }
            );
            if (!project) {
                return res.json({ result: false, error: 'Aucun projet correspondant à mettre à jour' });
            }
            res.json({ result: true });
        } catch (error) {
            res.json({ result: error });
        }
       
});



// Récupération d'un projet par son ID pour l'afficher sur la page commentaires
router.post("/projectById", async (req, res) => {

    // Vérification des éléments requis pour la route
    if (!checkBody(req.body, ['id', 'email', "token"])) {
        res.json({ result: false, error: 'Champs manquants ou vides' });
        return;
    }
    // Authentification de l'utilisateur
    const foundUser = await User.findOne({ email: req.body.email, token: req.body.token });
    !foundUser && res.json({ result: false, error: 'Access denied' });

    const project = await Project.findById(req.body.id).populate("userId", 'firstname username picture').populate('comments.userId', 'firstname username picture')
    if (!project) {
        return res.json({ result: false, message: "project non trouvé" });
    } else {
        return res.json({ result: true, info: project })
    }
});


// Ajout d'un commentaire
router.post('/comment', async (req, res) => {

    // Vérification des éléments requis pour la route
    if (!checkBody(req.body, ['id', 'email', "token", 'comment'])) {
        res.json({ result: false, error: 'Champs manquants ou vides' });
        return;
    }
    // Authentification de l'utilisateur
    const foundUser = await User.findOne({ email: req.body.email, token: req.body.token });
    !foundUser && res.json({ result: false, error: 'Access denied' });

    // Ajout d'un commentaire au projet existant
    const newComment = { text: req.body.comment, userId: foundUser._id };
    const projectToComment = await Project.findByIdAndUpdate(
        req.body.id,
        { $push: { comments: newComment } }
    );
    
    if (projectToComment) {
        res.json({
            result: true,
            newComment: {
                comment: req.body.comment,
                userId: foundUser._id,
            },
        });
    } else {
        res.json({ result: false, message: 'Project not found' });
    }
});


// Supprimer un commentaire et les signalements attribués
router.delete('/comment', async (req, res) => {

    // Vérification des éléments requis pour la route
    if (!checkBody(req.body, ['userId', 'email', "token", 'commentId', 'projectId'])) {
        res.json({ result: false, error: 'Champs manquants ou vides' });
        return;
    }
    // Authentification de l'utilisateur
    const foundUser = await User.findOne({ email: req.body.email, token: req.body.token, _id: userId });
    !foundUser && res.json({ result: false, error: 'Access denied' });

    const { projectId, commentId, userId } = req.body;
    
    const project = await Project.findByIdAndUpdate(
        projectId,
        { $pull: { comments: {_id : commentId}}},
        { new: true }
    )
    if (project) {
        res.json({ result: true, message: 'Comment successfully deleted', project });
    } else {
        res.json({ result: false, message: 'Comment not found' });
    }
})

module.exports = router;