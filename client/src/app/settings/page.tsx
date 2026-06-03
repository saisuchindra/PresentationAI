'use client';

import React, { useState, useEffect } from 'react';

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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

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
      <div className="flex-1 flex flex-col items-center justify-center py-12">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-400 text-sm">Loading configurations...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-3xl mx-auto w-full py-6">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl tracking-tight text-white mb-2">Settings</h1>
        <p className="text-gray-400">Configure your API credentials and preferences for presentation generation.</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl mb-6 border ${
          message.type === 'success' 
            ? 'bg-emerald-950/30 border-emerald-500/20 text-emerald-300' 
            : 'bg-rose-950/30 border-rose-500/20 text-rose-300'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Credentials Card */}
        <div className="glass-card p-6 rounded-2xl">
          <h2 className="font-display font-semibold text-lg text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full"></span> Core AI Engine
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="openRouterKey" className="block text-sm font-medium text-gray-300 mb-1.5">
                OpenRouter API Key <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                id="openRouterKey"
                value={keysInput.openRouterKey}
                onChange={(e) => setKeysInput({ ...keysInput, openRouterKey: e.target.value })}
                className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-all text-sm"
                placeholder={settings.hasOpenRouterKey ? '••••••••••••••••' : 'Enter your OpenRouter API key'}
              />
              <p className="mt-1.5 text-xs text-gray-500">
                Required for presentation research and content generator. Get a key from{' '}
                <a href="https://openrouter.ai" target="_blank" rel="noreferrer" className="text-primary hover:underline">
                  openrouter.ai
                </a>.
              </p>
            </div>

            <div>
              <label htmlFor="defaultModel" className="block text-sm font-medium text-gray-300 mb-1.5">
                Default AI Model
              </label>
              <select
                id="defaultModel"
                value={keysInput.defaultModel}
                onChange={(e) => setKeysInput({ ...keysInput, defaultModel: e.target.value })}
                className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary/50 transition-all text-sm"
              >
                <option value="google/gemini-2.5-flash">Google Gemini 2.5 Flash (Recommended - fast & efficient)</option>
                <option value="google/gemini-2.5-pro">Google Gemini 2.5 Pro (Analytical & deep)</option>
                <option value="anthropic/claude-3-5-sonnet">Anthropic Claude 3.5 Sonnet (Premium design output)</option>
                <option value="meta-llama/llama-3.3-70b-instruct">Meta Llama 3.3 70B (Articulate & clear)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Visuals Credentials Card */}
        <div className="glass-card p-6 rounded-2xl">
          <h2 className="font-display font-semibold text-lg text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-accent rounded-full"></span> Media & Imagery APIs
          </h2>
          <p className="text-xs text-gray-400 mb-4">
            Optional. If keys are omitted, the generator automatically uses premium public stock images matching your content.
          </p>
          <div className="space-y-4">
            <div>
              <label htmlFor="unsplashKey" className="block text-sm font-medium text-gray-300 mb-1.5">
                Unsplash Access Key
              </label>
              <input
                type="password"
                id="unsplashKey"
                value={keysInput.unsplashKey}
                onChange={(e) => setKeysInput({ ...keysInput, unsplashKey: e.target.value })}
                className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-all text-sm"
                placeholder={settings.hasUnsplashKey ? '••••••••••••••••' : 'Enter Unsplash Access Key'}
              />
            </div>

            <div>
              <label htmlFor="pexelsKey" className="block text-sm font-medium text-gray-300 mb-1.5">
                Pexels API Key
              </label>
              <input
                type="password"
                id="pexelsKey"
                value={keysInput.pexelsKey}
                onChange={(e) => setKeysInput({ ...keysInput, pexelsKey: e.target.value })}
                className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-all text-sm"
                placeholder={settings.hasPexelsKey ? '••••••••••••••••' : 'Enter Pexels API Key'}
              />
            </div>
          </div>
        </div>

        {/* Database Integration Card */}
        <div className="glass-card p-6 rounded-2xl">
          <h2 className="font-display font-semibold text-lg text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Supabase Sync (Optional)
          </h2>
          <p className="text-xs text-gray-400 mb-4">
            Stores history globally. If omitted, all presentation logs will be persisted to a local JSON file (`db.json`) on your machine.
          </p>
          <div className="space-y-4">
            <div>
              <label htmlFor="supabaseUrl" className="block text-sm font-medium text-gray-300 mb-1.5">
                Supabase Project URL
              </label>
              <input
                type="text"
                id="supabaseUrl"
                value={keysInput.supabaseUrl}
                onChange={(e) => setKeysInput({ ...keysInput, supabaseUrl: e.target.value })}
                className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-all text-sm"
                placeholder="e.g. https://xyz.supabase.co"
              />
            </div>

            <div>
              <label htmlFor="supabaseAnonKey" className="block text-sm font-medium text-gray-300 mb-1.5">
                Supabase Anon/Public API Key
              </label>
              <input
                type="password"
                id="supabaseAnonKey"
                value={keysInput.supabaseAnonKey}
                onChange={(e) => setKeysInput({ ...keysInput, supabaseAnonKey: e.target.value })}
                className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-all text-sm"
                placeholder={settings.hasSupabase ? '••••••••••••••••' : 'Enter Supabase Anon Key'}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white rounded-xl font-medium text-sm transition-all shadow-md shadow-primary/20 hover:shadow-primary/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Saving...
              </>
            ) : (
              'Save Configuration'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
