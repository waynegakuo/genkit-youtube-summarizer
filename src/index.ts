import { googleAI } from '@genkit-ai/googleai';
import { genkit } from 'genkit';
import express, { Request, Response, RequestHandler } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

const ai = genkit({
    plugins: [googleAI()],
    model: googleAI.model('gemini-2.0-flash'),
});

// API endpoint to summarize video
const summarizeHandler: RequestHandler = async (req, res) => {
    try {
        const { videoURL, prompt = 'Please summarize the following video:' } = req.body;

        if (!videoURL) {
            res.status(400).json({ error: 'Please provide a video URL' });
            return;
        }

        // Extract video ID for thumbnail
        const videoId = extractVideoId(videoURL);
        if (!videoId) {
            res.status(400).json({ error: 'Invalid YouTube URL' });
            return;
        }

        // Generate summary
        const { text } = await ai.generate({
            prompt: [{ text: prompt }, { media: { url: videoURL, contentType: 'video/mp4' } }],
        });

        // Return summary and video details
        res.json({
            summary: text,
            videoId,
            thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        });
    } catch (error) {
        console.error('Error processing video:', error);
        res.status(500).json({ error: 'Error processing video' });
    }
};

app.post('/api/summarize', summarizeHandler);

// Helper function to extract YouTube video ID
function extractVideoId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Serve the main HTML page
const homeHandler: RequestHandler = (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
};

app.get('/', homeHandler);

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
