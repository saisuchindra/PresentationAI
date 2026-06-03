"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const crypto_1 = __importDefault(require("crypto"));
const db_service_1 = require("./services/db.service");
const ai_service_1 = require("./services/ai.service");
const image_service_1 = require("./services/image.service");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Enable CORS
app.use((0, cors_1.default)());
// Parse JSON bodies
app.use(express_1.default.json());
// 1. Get Settings
app.get('/api/settings', (req, res) => {
    try {
        const settings = db_service_1.dbService.getSettings();
        // Mask keys for security when returning to client
        const maskKey = (key) => {
            if (!key)
                return '';
            if (key.length <= 8)
                return '********';
            return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
        };
        res.json({
            openRouterKey: maskKey(settings.openRouterKey),
            unsplashKey: maskKey(settings.unsplashKey),
            pexelsKey: maskKey(settings.pexelsKey),
            supabaseUrl: settings.supabaseUrl,
            supabaseAnonKey: maskKey(settings.supabaseAnonKey),
            defaultModel: settings.defaultModel,
            // Boolean flags to tell the client if keys are set
            hasOpenRouterKey: !!settings.openRouterKey,
            hasUnsplashKey: !!settings.unsplashKey,
            hasPexelsKey: !!settings.pexelsKey,
            hasSupabase: !!settings.supabaseUrl && !!settings.supabaseAnonKey,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// 2. Save Settings
app.post('/api/settings', (req, res) => {
    try {
        const { openRouterKey, unsplashKey, pexelsKey, supabaseUrl, supabaseAnonKey, defaultModel } = req.body;
        // We only update keys if they are not the masked ones
        const updateData = {};
        if (openRouterKey && !openRouterKey.includes('...'))
            updateData.openRouterKey = openRouterKey;
        if (unsplashKey && !unsplashKey.includes('...'))
            updateData.unsplashKey = unsplashKey;
        if (pexelsKey && !pexelsKey.includes('...'))
            updateData.pexelsKey = pexelsKey;
        if (supabaseAnonKey && !supabaseAnonKey.includes('...'))
            updateData.supabaseAnonKey = supabaseAnonKey;
        if (supabaseUrl !== undefined)
            updateData.supabaseUrl = supabaseUrl;
        if (defaultModel !== undefined)
            updateData.defaultModel = defaultModel;
        const saved = db_service_1.dbService.saveSettings(updateData);
        res.json({ message: 'Settings saved successfully', settings: saved });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// 3. Get Presentations History
app.get('/api/presentations', async (req, res) => {
    try {
        const presentations = await db_service_1.dbService.getPresentations();
        res.json(presentations);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// 4. Delete Presentation
app.delete('/api/presentations/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await db_service_1.dbService.deletePresentation(id);
        if (deleted) {
            res.json({ message: 'Presentation deleted successfully' });
        }
        else {
            res.status(404).json({ error: 'Presentation not found' });
        }
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// 5. Generate Presentation (SSE stream)
app.get('/api/generate', async (req, res) => {
    const topic = req.query.topic;
    const mode = req.query.mode || 'professional';
    const model = req.query.model;
    if (!topic) {
        res.status(400).json({ error: 'Topic query parameter is required' });
        return;
    }
    // Setup SSE Headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    const sendEvent = (event, data) => {
        res.write(`event: ${event}\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    };
    try {
        // 1. Generate text outline & content
        const rawPresentation = await ai_service_1.AIService.generatePresentation(topic, mode, model, (status) => {
            sendEvent('progress', { message: status });
        });
        // 2. Fetch images for slides that have imageSearchQuery
        sendEvent('progress', { message: 'Finding relevant images...' });
        const slidesWithImages = await Promise.all(rawPresentation.slides.map(async (slide, idx) => {
            if (slide.imageSearchQuery && slide.type !== 'references') {
                try {
                    sendEvent('progress', { message: `Finding visual assets for: ${slide.title}` });
                    const img = await image_service_1.ImageService.searchImage(slide.imageSearchQuery);
                    return { ...slide, image: img };
                }
                catch (imgErr) {
                    console.error(`Failed to find image for slide ${idx}:`, imgErr);
                    return slide;
                }
            }
            return slide;
        }));
        // 3. Assemble and save presentation
        sendEvent('progress', { message: 'Designing layout grids and templates...' });
        const presentationData = {
            ...rawPresentation,
            id: crypto_1.default.randomUUID(),
            slides: slidesWithImages,
        };
        sendEvent('progress', { message: 'Saving presentation to database...' });
        const saved = await db_service_1.dbService.savePresentation(presentationData);
        sendEvent('progress', { message: 'Presentation successfully created!' });
        sendEvent('result', saved);
    }
    catch (error) {
        console.error('SSE Generation error:', error);
        sendEvent('error', { message: error.message || 'An error occurred during generation' });
    }
    finally {
        res.end();
    }
});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
