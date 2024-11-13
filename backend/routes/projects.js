var express = require('express');
var router = express.Router();
require('../models/connection');
const { checkBody } = require('../modules/tools')
const Project = require('../models/projects');
const User = require('../models/users')
const Keyword = require("../models/keywords")
const cloudinary = require('../cloudinary');
const Genre = require('../models/genres')
const puppeteer = require('puppeteer');

// Middelware pour décoder les données de l'audio venant du frontend
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Route pour ajouter un projet en BDD
router.post("/add", async (req, res) => {

    // Vérification des éléments requis pour la route
    if (!checkBody(req.body, ['genre', 'prompt', 'email', "username", "rating", "name", "token"])) {
        res.json({ result: false, error: 'Champs manquants ou vides' });
        return;
    }
    // Authentification de l'utilisateur
    const foundUser = await User.findOne({ email: req.body.email, token: req.body.token })
    !foundUser && res.json({ result: false, error: 'Access denied' });

    let foundGenreId;
    foundGenreId = await Genre.findOne({ name: req.body.genre, userId: foundUser._id });
    foundGenreId = foundGenreId ? foundGenreId._id : null;

    if (!foundGenreId) {
        const newGenre = new Genre({ userId: foundUser._id, name: req.body.genre });
        try {
            const savedGenre = await newGenre.save();
            foundGenreId = savedGenre._id;
        } catch (error) {
            console.error('Error saving genre:', error);
        }
    }

    // Enregistrer en base de donnée le Prompt, sans les espaces à la fin et au début, et sans la virgule à la fin, et sans l'audio, même s'il y en a un
    const trimmedPrompt = req.body.prompt.trim();
    const formattedPrompt = trimmedPrompt[trimmedPrompt.length - 1] === "," ? trimmedPrompt.slice(0, -1) : trimmedPrompt;

    const newProject = new Project({
        genre: foundGenreId,
        prompt: formattedPrompt,
        audio: "",
        rating: req.body.rating,
        isPublic: req.body.isPublic,
        username: req.body.username,
        userId: foundUser._id,
        name: req.body.name
    });

    const savedProject = await newProject.save();

    // Récupérer les keywords de manière formatée 
    const incomingKeywords = []; //liste des Keywords et formaté du prompt . 
    const splittedIncomingKeywords = formattedPrompt.split(',');
    for (const word of splittedIncomingKeywords) {
        const trimmedWord = word.trim();
        if (trimmedWord) {
            incomingKeywords.push(trimmedWord.charAt(0).toUpperCase() + trimmedWord.toLowerCase().slice(1));
        }
    }

    const storedKeywordIds = []; // liste des Keywords existants
    const savedKeywords = []; // liste des Keywords à créer

    // Parcourir les Keywords entrants
    for (const word of incomingKeywords) {
        const foundKeyword = await Keyword.findOne({ name: word, userId: foundUser._id, genre: foundGenreId });

        // Si le Keyword n'existe pas, le créer
        if (!foundKeyword) {
            const newKeyword = new Keyword({
                userId: foundUser._id,
                name: word,
                iterations: 1,
                average_rating: req.body.rating,
                genre: foundGenreId,
            });
            const savedKeyword = await newKeyword.save();
            savedKeywords.push(savedKeyword._id);

        } else {
            storedKeywordIds.push(foundKeyword._id);
            let newScore = (foundKeyword.average_rating * foundKeyword.iterations) + savedProject.rating;
            await Keyword.updateOne(
                { _id: foundKeyword._id },
                { $inc: { iterations: 1 }, average_rating: newScore / (foundKeyword.iterations + 1) }
            );
        }
    }
    const allKeywordIds = [...savedKeywords, ...storedKeywordIds];

    for (const keywordId of allKeywordIds) {
        // Filtre pour ne pas mettre l'id du keyword dans ses propres relatives
        const otherKeywords = allKeywordIds.filter(id => id !== keywordId);
        await Keyword.updateOne(
            { _id: keywordId },
            { $addToSet: { relatedKeywords: { $each: otherKeywords } } } // Utilise $addToSet avec $each pour ajouter plusieurs éléments sans doublons
        );
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



// router.get('/get-audio-url', async (req, res) => {
//     const delay = Math.floor(Math.random() * 5000 + 1000); // délai aléatoire

//     try {
//         // Lancer une instance du navigateur si elle n'existe pas ou est déconnectée
//         if (!browser || !browser.isConnected()) {
//             browser = await puppeteer.launch({
//                 headless: false, // Changez en `true` pour le déploiement
//                 args: ['--no-sandbox', '--disable-setuid-sandbox']
//             });
//         }

//         // Vérifier s'il y a déjà une page ouverte pour la réutiliser
//         const pages = await browser.pages();
//         let page = pages.length > 0 ? pages[0] : await browser.newPage();

//         // Modifier l'User-Agent
//         await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36');

//         // Activer les logs de la page pour détecter les erreurs
//         page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));

//         // Aller à la page
//         await page.goto('https://suno-api-five-lemon.vercel.app/api/clip?id=23dee79f-2f10-4222-ad6c-8b5af1c3c605', { waitUntil: 'networkidle2' });

//         // Attendre un instant pour simuler le comportement naturel
//         await page.waitForTimeout(20000);

//         // Vérifier si le bouton Play existe
//         const playButtonExists = await page.evaluate(() => {
//             return document.querySelector('button[aria-label="Playbar: Play button"]') !== null;
//         });

//         if (playButtonExists) {
//             // Attendre que le bouton Play soit chargé, avec un délai supplémentaire
//             await page.waitForSelector('button[aria-label="Playbar: Play button"]', { visible: true, timeout: 10000 });

//             // Cliquer sur le bouton Play
//             await page.click('button[aria-label="Playbar: Play button"]');

//             // Reprendre l'AudioContext après le clic pour s'assurer qu'il démarre
//             await page.evaluate(() => {
//                 const audioContext = new (window.AudioContext || window.webkitAudioContext)();
//                 if (audioContext.state === 'suspended') {
//                     audioContext.resume();
//                 }
//             });

//             // Attendre que l'audio se charge et commence à jouer
//             await page.waitForTimeout(5000);

//             // Récupérer l'URL de l'audio
//             const audioSrc = await page.evaluate(() => {
//                 const audioElement = document.querySelector('#active-audio-play');
//                 return audioElement ? audioElement.src : null;
//             });

//             // Envoyer l'URL audio au frontend
//             if (audioSrc) {
//                 res.json({ audioUrl: audioSrc });
//             } else {
//                 res.status(404).json({ error: 'Audio non trouvé' });
//             }
//         } else {
//             res.status(404).json({ error: 'Bouton Play non trouvé ou bloqué par Captcha' });
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Erreur interne du serveur' });
//     }
// });



// Recherche par titre



// Suppression d'un prompt

router.get("/get-suno-clip/:sunoLink", async (req, res) => {


    const { sunoLink } = req.params;
    const fetchApi = await fetch(`https://suno-api-five-lemon.vercel.app/api/clip?id=${sunoLink}`)
    const projectData = await fetchApi.json()

    if (projectData.metadata) {
        const project = {
            prompt: projectData.metadata.tags,
            lyrics: projectData.metadata.prompt,
            duration: projectData.metadata.duration,
            hasVocals: projectData.metadata.has_vocal,
            audio: projectData.audio_url,
            name: projectData.title,
            songImage: projectData.image_large_url,
            avatarImage: projectData.avatar_image_url,
            modelVersion: projectData.major_model_version,
            author: projectData.display_name,
            playCount: projectData.play_count,
            upVoteCount: projectData.upvote_count,
            isPublic: projectData.is_public,
        }
        res.json({ result: true, project });
    } else {
        res.status(404).json({ result: false, error: 'Projet non trouvé' });
    }

})

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
                { $push: { reports: { userId: foundUser._id, text: req.body.text } } }
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
            { $push: { comments: { reports: { userId: foundUser._id, text: req.body.text } } } }
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
        { $pull: { comments: { _id: commentId } } },
        { new: true }
    )
    if (project) {
        res.json({ result: true, message: 'Comment successfully deleted', project });
    } else {
        res.json({ result: false, message: 'Comment not found' });
    }
})

module.exports = router;