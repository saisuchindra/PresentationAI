'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [topic, setTopic] = useState('');
  const [mode, setMode] = useState<'traditional' | 'professional'>('professional');
  const [model, setModel] = useState('google/gemini-2.5-flash');

  const examples = [
    'Artificial Intelligence',
    'Machine Learning',
    'Electric Vehicles',
    'Cloud Computing',
    'Solar Energy',
    'Database Management System',
  ];

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    const query = new URLSearchParams({
      topic: topic.trim(),
      mode,
      model,
    }).toString();

    router.push(`/generator?${query}`);
  };

  return (
    <div className="flex-1 flex flex-col justify-center py-16 md:py-20 relative overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/20 via-slate-950 to-slate-950 pointer-events-none"></div>
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-5xl mx-auto w-full px-6 relative z-10">
        
        {/* Hero Section */}
        <div className="mb-16 md:mb-20">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">
              Research-First Approach
            </span>
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
              <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
            </div>
          </div>
          
          {/* Main Headline */}
          <h1 className="font-display font-bold text-5xl md:text-7xl tracking-tight text-white leading-tight mb-6">
            Research-Backed
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-300">Presentations</span>
          </h1>
          
          {/* Subheading */}
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl font-light leading-relaxed">
            Skip the fluff. Generate structured, data-driven slides with sources, 
            native charts, and real insights. Built for professionals who value substance.
          </p>
        </div>

        {/* Action Panel - Refined */}
        <div className="mb-16 relative">
          <form onSubmit={handleGenerate} className="space-y-5">
            
            {/* Topic Input - Simplified */}
            <div className="relative group">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="What's your topic?"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl pl-6 pr-28 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all text-lg"
                required
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-6 py-2 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white rounded-xl font-semibold text-sm transition-all duration-150 flex items-center justify-center cursor-pointer gap-2"
              >
                <Sparkles size={16} />
                Generate
              </button>
            </div>

            {/* Options Row - More spacious */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-400 text-left mb-2 uppercase tracking-wider">Style</label>
                <div className="flex gap-3">
                  {['professional', 'traditional'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMode(m as 'traditional' | 'professional')}
                      className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-150 ${
                        mode === m
                          ? 'bg-purple-600/90 text-white shadow-lg shadow-purple-500/20'
                          : 'bg-slate-800/30 text-gray-400 hover:bg-slate-800/50 border border-slate-700/50'
                      }`}
                    >
                      {m === 'professional' ? 'Professional' : 'Traditional'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 text-left mb-2 uppercase tracking-wider">Model</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all text-sm font-medium"
                >
                  <option value="google/gemini-2.5-flash">Gemini Flash</option>
                  <option value="google/gemini-2.5-pro">Gemini Pro</option>
                  <option value="anthropic/claude-3-5-sonnet">Claude Sonnet</option>
                  <option value="meta-llama/llama-3.3-70b-instruct">Llama 3.3</option>
                </select>
              </div>
            </div>

          </form>
        </div>

        {/* Examples Section - Horizontal layout */}
        <div>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest mb-4">Popular starting points</p>
          <div className="flex flex-wrap items-center gap-2">
            {examples.map((ex) => (
              <button
                key={ex}
                onClick={() => setTopic(ex)}
                className="px-4 py-2 text-sm font-medium bg-slate-800/40 hover:bg-slate-800/60 text-gray-300 hover:text-white rounded-lg border border-slate-700/50 transition-all duration-150 cursor-pointer"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
