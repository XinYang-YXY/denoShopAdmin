const azureCognitiveService = require('./azure_NLP');

const textInput = [
    "Game of the year. I'm obviously being sarcastic. The 'story' is a complete joke, not saying the first was any better but the sequel makes any development that happened in that game pointless to fit in a blatant political pandering which is obvious for all to see. The gameplay doesn't fair any better either with it being rather shallow with rididled button prompts(yay interactive movies). just save your money and watch the movi- I mean, game, on youtube and at least get some laughter out of it if anything. That way you won't have buyers remorse and you can feel better about yourself knowing there are a lot of people who bought it and delude themselves into thinking it's good to justify their purchase. Masterpiece my ass! The prequel wasn't one but it was a good game which is more than I can say for this."
];

azureCognitiveService.analyzeText(textInput);