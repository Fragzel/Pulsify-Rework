var express = require('express');
var router = express.Router();
require('../models/connection');

const Keyword = require('../models/keywords');
const User = require('../models/users');
const Project = require('../models/projects');
const Genre = require('../models/genres');
const { checkBody } = require('../modules/tools');

router.post('/search', async (req, res) => {

    if (!checkBody(req.body, ['keyword', 'email', "token"])) {
        res.json({ result: false, error: 'Champs vides ou manquants' });
        return;
    }

    const formattedRegex = new RegExp(req.body.keyword, "i");



        const foundProjects = await Project.find({ prompt: formattedRegex }).populate("genre" , "name").populate("userId", "firstname username picture")

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



router.post("/suggestions", async (req, res) => {

    // Vérification des éléments requis pour la route
    if (!checkBody(req.body, ['token', 'genre', 'email'])) {
        res.json({ result: false, error: 'Champs manquants ou vides' });
        return;
    }

    // Authentification de l'utilisateur
    const foundUser = await User.findOne({ email: req.body.email, token: req.body.token })
    !foundUser && res.json({ result: false, error: 'Access denied' });

    // Initialisation de la liste de suggestions
    let suggestionsList = [];
    const foundGenre = await Genre.findOne({ name: { $regex: new RegExp(req.body.genre, "i") } })
    const foundGenreId = foundGenre._id

    // Afficher des suggestions de départ si le champ prompt n'est pas rempli
    if (req.body.partialPrompt === '') {
        if (!req.body.includeLikedProjects) {
            const allKeywords = await Keyword.find({ userId: foundUser._id, genre: foundGenreId });
            res.json({ result: true, totalScore: 0, suggestionsList: allKeywords });
            return;
        } else {
            const allKeywords = await Keyword.find({ genre: foundGenreId });
            res.json({ result: true, totalScore: 0, suggestionsList: allKeywords.sort((a, b) => { a.iterations - b.iterations }) });
            return;
        }
    }

    // Récupérer les keywords de manière formatée 
    const promptToSplit = req.body.partialPrompt.trim()
    const promptToSplitWithoutComa = promptToSplit[promptToSplit.length - 1] === "," ? promptToSplit.slice(0, -1) : promptToSplit
    const splittedKeywords = promptToSplitWithoutComa.split(',')
    const keywords = []
    for (const wordToFormat of splittedKeywords) {
        const trimmedWords = wordToFormat.trim()
        keywords.push(trimmedWords.charAt(0).toUpperCase() + trimmedWords.slice(1))
    }

    // Fonction pour échapper tous les caractères spéciaux
    const escapeRegex = (keyword) => {
        return keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    let regexKeywords = keywords.map(keyword => new RegExp(`^${escapeRegex(keyword)}$`, 'i'));


    //Initialisation des coefficients de calcul du score
    const weight_rating = 0.7;
    const weight_iterations = 0.3;

    // Création de la pipeline Mongoose

    let pipeline = [];

    if (req.body.partialPrompt) {
        if (req.body.includeLikedProjects) {
            // Si la case Inclure la Communauté est cochée
            pipeline.push(
                // Match pour garder les keywords qui correspondent à tous le prompts likés, au genre et à ce qui est tapé dans le prompt
                {
                    $match: {
                        genre: foundGenreId,
                        name: { $in: regexKeywords }
                    }
                }
            );
        } else {
            // Si la case Inclure la Communauté n'est pas cochée
            pipeline.push(
                // Match pour garder les keywords qui correspondent à l'utilisateur, au genre et à ce qui est tapé dans le prompt
                {
                    $match: {
                        userId: foundUser._id,
                        genre: foundGenreId,
                        name: { $in: regexKeywords }
                    }
                }
            );
        }
    } else {
        pipeline.push(
            // Match pour garder les keywords qui correspondent à tous les prompts likés, et au genre
            {
                $match: {
                    _id: { $in: foundUser.likedProjects },
                    genre: foundGenreId,
                }
            }
        );
    }

    pipeline.push(
        // On unwind relatedKeywords pour traiter chacun individuellement
        {
            $unwind: "$relatedKeywords"
        },
        // Populate ou 'jointure'
        {
            $lookup: {
                from: "keywords",
                localField: "relatedKeywords",
                foreignField: "_id",
                as: "related_keyword_data"
            }
        },
        // On accède aux data des relatedKeywords de façon individuelle
        {
            $unwind: "$related_keyword_data"
        },
        // On ajoute des champs temporaires pour calculer le score global
        {
            $addFields: {
                score_global: {
                    $add: [
                        { $multiply: [weight_rating, "$related_keyword_data.average_rating"] },
                        { $multiply: [weight_iterations, { $log10: "$related_keyword_data.iterations" }] }
                    ]
                }
            }
        },
        // Si un related_keyword vient deux ou plusieurs fois, on en garde qu'un et on additionne le score_global
        {
            $group: {
                _id: "$related_keyword_data._id",
                name: { $first: "$related_keyword_data.name" },
                score_global: { $sum: "$score_global" }
            }
        },
        // On enlève des résultats les keywords que l'utilisateur a déjà tapé
        {
            $match: {
                name: { $nin: keywords }
            }
        },
        // Le tri
        {
            $sort: {
                score_global: -1
            }
        },
        // On en garde que 10
        {
            $limit: 10
        },
        // On rajoute un totalScore qui servira au front à calculer le pourcentage et on range le reste dans 'suggestions'
        {
            $group: {
                _id: null,
                totalScore: { $sum: "$score_global" },
                suggestions: { $push: { name: "$name", score_global: "$score_global" } }
            }
        }
    );

    suggestionsList = await Keyword.aggregate(pipeline);

    // Réponse avec la liste de suggestions
    res.json(suggestionsList.length
        ? { result: true, totalScore: suggestionsList[0].totalScore, suggestionsList: suggestionsList[0].suggestions }
        : { result: true, totalScore: 0, suggestionsList: [] }
    );

})











module.exports = router;