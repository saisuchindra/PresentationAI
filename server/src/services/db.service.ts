import fs from 'fs';
import path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DB_FILE = path.join(__dirname, '../../db.json');

export interface Settings {
  openRouterKey: string;
  unsplashKey: string;
  pexelsKey: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  defaultModel: string;
}

export interface SlideContent {
  id: string;
  title: string;
  type: 'title' | 'content' | 'chart' | 'table' | 'quote' | 'references';
  bullets?: string[];
  chartData?: { label: string; value: number }[];
  chartType?: 'bar' | 'pie' | 'line';
  tableData?: string[][]; // Row arrays
  quote?: string;
  quoteAuthor?: string;
  image?: {
    url: string;
    description: string;
    photographer: string;
    photographerUrl: string;
  };
  imageSearchQuery?: string;
}

export interface Presentation {
  id: string;
  topic: string;
  mode: 'traditional' | 'professional';
  model: string;
  outline: string[];
  slides: SlideContent[];
  createdAt: string;
}

interface LocalDB {
  settings: Settings;
  presentations: Presentation[];
}

const defaultSettings: Settings = {
  openRouterKey: '',
  unsplashKey: '',
  pexelsKey: '',
  supabaseUrl: '',
  supabaseAnonKey: '',
  defaultModel: 'google/gemini-2.5-flash',
};

class DBService {
  private memoryDb: LocalDB = {
    settings: { ...defaultSettings },
    presentations: [],
  };

  private supabase: SupabaseClient | null = null;

  constructor() {
    this.loadLocalDB();
    this.initSupabase();
  }

  private loadLocalDB() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const data = fs.readFileSync(DB_FILE, 'utf-8');
        this.memoryDb = JSON.parse(data);
      } else {
        this.saveLocalDB();
      }
    } catch (error) {
      console.error('Failed to load local DB, using in-memory fallback:', error);
    }
  }

  private saveLocalDB() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.memoryDb, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to save to local DB file:', error);
    }
  }

  private initSupabase() {
    const { supabaseUrl, supabaseAnonKey } = this.memoryDb.settings;
    const envUrl = process.env.SUPABASE_URL || supabaseUrl;
    const envKey = process.env.SUPABASE_ANON_KEY || supabaseAnonKey;

    if (envUrl && envKey) {
      try {
        this.supabase = createClient(envUrl, envKey);
        console.log('Supabase client initialized successfully.');
      } catch (err) {
        console.error('Error initializing Supabase client:', err);
        this.supabase = null;
      }
    } else {
      this.supabase = null;
    }
  }

  // Settings Methods
  public getSettings(): Settings {
    // Merge local storage settings with environment variables if present
    return {
      openRouterKey: process.env.OPENROUTER_API_KEY || this.memoryDb.settings.openRouterKey || '',
      unsplashKey: process.env.UNSPLASH_ACCESS_KEY || this.memoryDb.settings.unsplashKey || '',
      pexelsKey: process.env.PEXELS_API_KEY || this.memoryDb.settings.pexelsKey || '',
      supabaseUrl: process.env.SUPABASE_URL || this.memoryDb.settings.supabaseUrl || '',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || this.memoryDb.settings.supabaseAnonKey || '',
      defaultModel: process.env.DEFAULT_MODEL || this.memoryDb.settings.defaultModel || 'google/gemini-2.5-flash',
    };
  }

  public saveSettings(settings: Partial<Settings>) {
    this.memoryDb.settings = {
      ...this.memoryDb.settings,
      ...settings,
    };
    this.saveLocalDB();
    this.initSupabase(); // Re-initialize in case Supabase credentials changed
    return this.getSettings();
  }

  // Presentations Methods
  public async getPresentations(): Promise<Presentation[]> {
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('presentations')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data.map((item: any) => ({
            id: item.id,
            topic: item.topic,
            mode: item.mode,
            model: item.model,
            outline: item.outline,
            slides: item.slides,
            createdAt: item.created_at,
          }));
        }
        console.error('Supabase error getting presentations, falling back to local:', error);
      } catch (err) {
        console.error('Exception reading from Supabase, falling back:', err);
      }
    }
    return [...this.memoryDb.presentations].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public async savePresentation(pres: Omit<Presentation, 'createdAt'>): Promise<Presentation> {
    const newPres: Presentation = {
      ...pres,
      createdAt: new Date().toISOString(),
    };

    // Save locally
    this.memoryDb.presentations.push(newPres);
    this.saveLocalDB();

    // Save to Supabase if connected
    if (this.supabase) {
      try {
        const { error } = await this.supabase
          .from('presentations')
          .insert({
            id: newPres.id,
            topic: newPres.topic,
            mode: newPres.mode,
            model: newPres.model,
            outline: newPres.outline,
            slides: newPres.slides,
            created_at: newPres.createdAt,
          });

        if (error) {
          console.error('Supabase error inserting presentation:', error);
        }
      } catch (err) {
        console.error('Exception writing to Supabase:', err);
      }
    }

    return newPres;
  }

  public async deletePresentation(id: string): Promise<boolean> {
    const initialLength = this.memoryDb.presentations.length;
    this.memoryDb.presentations = this.memoryDb.presentations.filter((p) => p.id !== id);
    this.saveLocalDB();

    let deletedFromSupabase = false;
    if (this.supabase) {
      try {
        const { error } = await this.supabase
          .from('presentations')
          .delete()
          .eq('id', id);

        if (!error) deletedFromSupabase = true;
        else console.error('Supabase error deleting presentation:', error);
      } catch (err) {
        console.error('Exception deleting from Supabase:', err);
      }
    }

    return this.memoryDb.presentations.length < initialLength || deletedFromSupabase;
  }
}

export const dbService = new DBService();
