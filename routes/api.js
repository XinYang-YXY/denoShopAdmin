const express = require('express');
const ProductStats = require('../models/ProductStats');
const ProductRatings = require('../models/ProductRatings');
const UserRatings = require('../models/UserRating');
const router = express.Router();
const currentDate = new Date();

// Natural Language Processing API
// part of Azure's Cognitive Services(Microsoft's AI service)
const { TextAnalyticsClient, AzureKeyCredential } = require("@azure/ai-text-analytics");
const key = 'c8874843b0074d2fb7521debf1885935';
const endpoint = 'https://customer-comment-analysis.cognitiveservices.azure.com/';

async function analyzeText(textInput) {
    const client = new TextAnalyticsClient(endpoint, new AzureKeyCredential(key));
    let keyPhases = '';
    let sentiment = '';
    let score = {};

    const keyPhraseResult = await client.extractKeyPhrases(textInput);
    const sentimentResult = await client.analyzeSentiment(textInput);

    keyPhraseResult.forEach(document => {
        keyPhases = document.keyPhrases;
    });

    sentimentResult.forEach(document => {
        sentiment = document.sentiment;
        score = { positive: document.confidenceScores.positive.toFixed(2), negative: document.confidenceScores.negative.toFixed(2), neutral: document.confidenceScores.neutral.toFixed(2) }
    });
    return { keyPhases, sentiment, score }
}

router.get('/product-sold-rate/:id', (req, res) => {
    ProductStats.findOne({
        where: {
            year: currentDate.getFullYear(),
            hackingProductId: req.params.id
        }
    })
        .then(statsData => {
            return [statsData.jan, statsData.feb, statsData.mar, statsData.apr, statsData.may, statsData.jun,
            statsData.jul, statsData.aug, statsData.sep, statsData.oct, statsData.nov, statsData.dec];
        })
        .then(statsData => {
            ProductRatings.findOne({
                where: {
                    year: currentDate.getFullYear(),
                    hackingProductId: req.params.id
                }
            }).then(ratingsData => {
                res.json(JSON.stringify([statsData, [ratingsData.jan, ratingsData.feb, ratingsData.mar, ratingsData.apr, ratingsData.may, ratingsData.jun,
                ratingsData.jul, ratingsData.aug, ratingsData.sep, ratingsData.oct, ratingsData.nov, ratingsData.dec]]))
            })
        })
});

router.get('/product-comment/:id', (req, res) => {
    UserRatings.findAll({
        where: {
            hackingProductId: req.params.id
        }
    }).then(data => {
        let doc = '';
        data.forEach(o => {
            doc += o.comment + '\n';
        });
        return [doc]
    }).then(textInput => {
        return analyzeText(textInput);
    }).then(data => {
        console.log(`Key Phases: ${data.keyPhases}`);
        console.log(`Sentiment: ${data.sentiment}`);
        console.log(`Score: ${data.score}`);
        res.json(data);
    }).catch(err => console.log(err));    
});
module.exports = router;