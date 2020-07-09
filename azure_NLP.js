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
        score = { positive: document.confidenceScores.positive.toFixed(2), negatuve: document.confidenceScores.negative.toFixed(2), neutral: document.confidenceScores.neutral.toFixed(2) }
    });
    return { keyPhases, sentiment, score }
}
exports.analyzeText = analyzeText;
