import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { dbService } from './services/db.service';
import { AIService } from './services/ai.service';
import { ImageService } from './services/image.service';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());
// Parse JSON bodies
app.use(express.json());

// 1. Get Settings
app.get('/api/settings', (req, res) => {
  try {
    const settings = dbService.getSettings();
    // Mask keys for security when returning to client
    const maskKey = (key: string) => {
      if (!key) return '';
      if (key.length <= 8) return '********';
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Save Settings
app.post('/api/settings', (req, res) => {
  try {
    const { openRouterKey, unsplashKey, pexelsKey, supabaseUrl, supabaseAnonKey, defaultModel } = req.body;
    
    // We only update keys if they are not the masked ones
    const updateData: any = {};
    if (openRouterKey && !openRouterKey.includes('...')) updateData.openRouterKey = openRouterKey;
    if (unsplashKey && !unsplashKey.includes('...')) updateData.unsplashKey = unsplashKey;
    if (pexelsKey && !pexelsKey.includes('...')) updateData.pexelsKey = pexelsKey;
    if (supabaseAnonKey && !supabaseAnonKey.includes('...')) updateData.supabaseAnonKey = supabaseAnonKey;
    if (supabaseUrl !== undefined) updateData.supabaseUrl = supabaseUrl;
    if (defaultModel !== undefined) updateData.defaultModel = defaultModel;

    const saved = dbService.saveSettings(updateData);
    res.json({ message: 'Settings saved successfully', settings: saved });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Get Presentations History
app.get('/api/presentations', async (req, res) => {
  try {
    const presentations = await dbService.getPresentations();
    res.json(presentations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Delete Presentation
app.delete('/api/presentations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await dbService.deletePresentation(id);
    if (deleted) {
      res.json({ message: 'Presentation deleted successfully' });
    } else {
      res.status(404).json({ error: 'Presentation not found' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Generate Presentation (SSE stream)
app.get('/api/generate', async (req, res) => {
  const topic = req.query.topic as string;
  const mode = (req.query.mode as 'traditional' | 'professional') || 'professional';
  const model = req.query.model as string;

  if (!topic) {
    res.status(400).json({ error: 'Topic query parameter is required' });
    return;
  }

  // Setup SSE Headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sendEvent = (event: string, data: any) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    // 1. Generate text outline & content
    const rawPresentation = await AIService.generatePresentation(
      topic,
      mode,
      model,
      (status) => {
        sendEvent('progress', { message: status });
      }
    );

    // 2. Fetch images for slides that have imageSearchQuery
    sendEvent('progress', { message: 'Finding relevant images...' });
    const slidesWithImages = await Promise.all(
      rawPresentation.slides.map(async (slide, idx) => {
        if (slide.imageSearchQuery && slide.type !== 'references') {
          try {
            sendEvent('progress', { message: `Finding visual assets for: ${slide.title}` });
            const img = await ImageService.searchImage(slide.imageSearchQuery);
            return { ...slide, image: img };
          } catch (imgErr) {
            console.error(`Failed to find image for slide ${idx}:`, imgErr);
            return slide;
          }
        }
        return slide;
      })
    );

    // 3. Assemble and save presentation
    sendEvent('progress', { message: 'Designing layout grids and templates...' });
    const presentationData = {
      ...rawPresentation,
      id: crypto.randomUUID(),
      slides: slidesWithImages,
    };

    sendEvent('progress', { message: 'Saving presentation to database...' });
    const saved = await dbService.savePresentation(presentationData);

    sendEvent('progress', { message: 'Presentation successfully created!' });
    sendEvent('result', saved);
  } catch (error: any) {
    console.error('SSE Generation error:', error);
    sendEvent('error', { message: error.message || 'An error occurred during generation' });
  } finally {
    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
