'use client';

import React, { useState, useEffect } from 'react';
import { Save, Database, Image as ImageIcon, Sparkles, Eye, EyeOff } from 'lucide-react';

interface Settings {
  openRouterKey: string;
  unsplashKey: string;
  pexelsKey: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  defaultModel: string;
  hasOpenRouterKey: boolean;
  hasUnsplashKey: boolean;
  hasPexelsKey: boolean;
  hasSupabase: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    openRouterKey: '',
    unsplashKey: '',
    pexelsKey: '',
    supabaseUrl: '',
    supabaseAnonKey: '',
    defaultModel: 'google/gemini-2.5-flash',
    hasOpenRouterKey: false,
    hasUnsplashKey: false,
    hasPexelsKey: false,
    hasSupabase: false,
  });

  const [keysInput, setKeysInput] = useState({
    openRouterKey: '',
    unsplashKey: '',
    pexelsKey: '',
    supabaseUrl: '',
    supabaseAnonKey: '',
    defaultModel: 'google/gemini-2.5-flash',
  });

  const [showOpenRouter, setShowOpenRouter] = useState(false);
  const [showSupabaseAnon, setShowSupabaseAnon] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        setKeysInput({
          openRouterKey: data.openRouterKey || '',
          unsplashKey: data.unsplashKey || '',
          pexelsKey: data.pexelsKey || '',
          supabaseUrl: data.supabaseUrl || '',
          supabaseAnonKey: data.supabaseAnonKey || '',
          defaultModel: data.defaultModel || 'google/gemini-2.5-flash',
        });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to connect to backend server. Make sure it is running on port 5000.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSettings();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });

      const res = await fetch('http://localhost:5000/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(keysInput),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
        fetchSettings(); // Refresh settings to show masked values
      } else {
        setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Connection error. Check backend logs.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-12 relative z-10">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-on-surface-variant text-sm font-light">Loading configuration profiles...</p>
      </div>
    );
  }

  return (
    <div className="flex-grow max-w-4xl mx-auto w-full py-6 relative z-10">
      
      {/* Header */}
      <header className="mb-12">
        <h1 className="font-display font-extrabold text-3xl md:text-4xl text-white mb-2 tracking-tight">Configuration Settings</h1>
        <p className="text-sm text-on-surface-variant max-w-xl font-light">Configure your API credentials, database synching, and default models for slide generation.</p>
      </header>

      {message.text && (
        <div className={`p-4 rounded-xl mb-8 border text-xs font-semibold ${
          message.type === 'success' 
            ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-300' 
            : 'bg-rose-950/20 border-rose-500/20 text-rose-300'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left column: Core AI config (Spans 7 columns) */}
        <div className="md:col-span-7 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden bg-white/5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
            
            <h2 className="font-display font-bold text-base text-white mb-6 flex items-center gap-2">
              <Sparkles size={16} className="text-primary" />
              Core AI Generation Engine
            </h2>
            
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="openRouterKey">
                  OpenRouter API Key <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showOpenRouter ? 'text' : 'password'}
                    id="openRouterKey"
                    value={keysInput.openRouterKey}
                    onChange={(e) => setKeysInput({ ...keysInput, openRouterKey: e.target.value })}
                    className="w-full bg-[#020617] border border-white/10 rounded-lg px-4 py-2.5 text-white font-code text-xs input-glow transition-all placeholder-white/20"
                    placeholder={settings.hasOpenRouterKey ? '••••••••••••••••' : 'sk-or-v1-...'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOpenRouter(!showOpenRouter)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                  >
                    {showOpenRouter ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-[10px] text-on-surface-variant/75 mt-1 font-light">
                  Required. Enter your key from{' '}
                  <a href="https://openrouter.ai" target="_blank" rel="noreferrer" className="text-primary hover:underline font-normal">
                    openrouter.ai
                  </a> to authorize research queries.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="defaultModel">
                  Default LLM Model
                </label>
                <select
                  id="defaultModel"
                  value={keysInput.defaultModel}
                  onChange={(e) => setKeysInput({ ...keysInput, defaultModel: e.target.value })}
                  className="w-full bg-[#020617] border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4] transition-all font-medium h-[38px]"
                >
                  <option value="google/gemini-2.5-flash">Google Gemini 2.5 Flash (Recommended)</option>
                  <option value="google/gemini-2.5-pro">Google Gemini 2.5 Pro (Deep research)</option>
                  <option value="anthropic/claude-3-5-sonnet">Anthropic Claude 3.5 Sonnet (Premium layouts)</option>
                  <option value="meta-llama/llama-3.3-70b-instruct">Meta Llama 3.3 70B (High articulation)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Database Sync Card */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden bg-white/5">
            <h2 className="font-display font-bold text-base text-white mb-4 flex items-center gap-2">
              <Database size={16} className="text-[#06b6d4]" />
              Database Synchronization
            </h2>
            <p className="text-[11px] text-on-surface-variant font-light mb-6">
              Optional sync to share presentation history. Defaults to local host storage file (`db.json`) if omitted.
            </p>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="supabaseUrl">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  id="supabaseUrl"
                  value={keysInput.supabaseUrl}
                  onChange={(e) => setKeysInput({ ...keysInput, supabaseUrl: e.target.value })}
                  className="w-full bg-[#020617] border border-white/10 rounded-lg px-4 py-2.5 text-white font-code text-xs input-glow transition-all placeholder-white/20"
                  placeholder="https://xyz.supabase.co"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="supabaseAnonKey">
                  Supabase Anon/Public Key
                </label>
                <div className="relative">
                  <input
                    type={showSupabaseAnon ? 'text' : 'password'}
                    id="supabaseAnonKey"
                    value={keysInput.supabaseAnonKey}
                    onChange={(e) => setKeysInput({ ...keysInput, supabaseAnonKey: e.target.value })}
                    className="w-full bg-[#020617] border border-white/10 rounded-lg px-4 py-2.5 text-white font-code text-xs input-glow transition-all placeholder-white/20"
                    placeholder={settings.hasSupabase ? '••••••••••••••••' : 'eyJhbGciOiJIUzI1NiIsInR5...'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSupabaseAnon(!showSupabaseAnon)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                  >
                    {showSupabaseAnon ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Media keys and Actions (Spans 5 columns) */}
        <div className="md:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden bg-white/5">
            <h2 className="font-display font-bold text-base text-white mb-4 flex items-center gap-2">
              <ImageIcon size={16} className="text-[#ffafd3]" />
              Visual Media Integrations
            </h2>
            <p className="text-[11px] text-on-surface-variant font-light mb-6">
              Optional credentials to source custom graphics. Standard stock imagery falls back automatically.
            </p>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="unsplashKey">
                  Unsplash Access Key
                </label>
                <input
                  type="password"
                  id="unsplashKey"
                  value={keysInput.unsplashKey}
                  onChange={(e) => setKeysInput({ ...keysInput, unsplashKey: e.target.value })}
                  className="w-full bg-[#020617] border border-white/10 rounded-lg px-4 py-2.5 text-white font-code text-xs input-glow transition-all placeholder-white/20"
                  placeholder={settings.hasUnsplashKey ? '••••••••••••••••' : 'Enter Unsplash Access Key'}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="pexelsKey">
                  Pexels API Key
                </label>
                <input
                  type="password"
                  id="pexelsKey"
                  value={keysInput.pexelsKey}
                  onChange={(e) => setKeysInput({ ...keysInput, pexelsKey: e.target.value })}
                  className="w-full bg-[#020617] border border-white/10 rounded-lg px-4 py-2.5 text-white font-code text-xs input-glow transition-all placeholder-white/20"
                  placeholder={settings.hasPexelsKey ? '••••••••••••••••' : 'Enter Pexels API Key'}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-primary text-on-primary font-label-md text-label-md py-3 px-4 rounded-xl hover:bg-primary-fixed transition-colors shadow-lg shadow-primary/20 hover:shadow-primary/30 flex justify-center items-center gap-2 border border-primary/50 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Configurations
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
