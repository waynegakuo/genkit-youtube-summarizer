import { googleAI } from '@genkit-ai/googleai';
import { genkit } from 'genkit';

const ai = genkit({
    plugins: [googleAI()],
    model: googleAI.model('gemini-2.0-flash'),
});

(async () => {
    try {
        // Step 1: get command line arguments
        const videoURL = process.argv[2];
        if (!videoURL) {
            console.error('Please provide a video URL as a command line argument.');
            process.exit(1);
        }
        // Step 2: construct prompt
        const prompt = process.argv[3] || 'Please summarize the following video:';
        // Step 3: process video
        const { text } = await ai.generate({
            prompt: [{ text: prompt }, { media: { url: videoURL, contentType: 'video/mp4' } }],
        });
        console.log(text);
    } catch (error) {
        console.error('Error processing video:', error);
    }
})(); // <-- don't forget the trailing parentheses to call the function!