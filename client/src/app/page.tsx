'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Check, Layers, Cpu, Users } from 'lucide-react';

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
    <div className="flex-1 flex flex-col justify-start relative">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none z-0"></div>
      <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-[#06b6d4]/5 rounded-full blur-[80px] pointer-events-none z-0"></div>

      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center min-h-[80vh] py-12 relative z-10">
        
        {/* Hero Left: Title and Prompt Form */}
        <div className="lg:col-span-6 flex flex-col gap-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary w-fit text-xs font-semibold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#06b6d4] animate-pulse"></span>
            Research-Backed Presentations
          </div>
          
          <h1 className="font-display text-4xl md:text-6xl text-white leading-tight font-extrabold tracking-tight">
            Transform Data into <br />
            <span className="text-gradient">Persuasive Stories</span>
          </h1>
          
          <p className="text-base md:text-lg text-on-surface-variant max-w-xl font-light leading-relaxed">
            Harness the power of generative AI to instantly convert complex datasets and outlines into visually stunning, high-impact presentations.
          </p>

          {/* Interactive Generator Form */}
          <form onSubmit={handleGenerate} className="space-y-5 w-full">
            
            {/* Topic Input - Gradient-Border Prompt Bar */}
            <div className="relative group p-[1.5px] bg-gradient-to-r from-primary via-[#06b6d4] to-primary rounded-2xl shadow-lg hover:shadow-primary/20 transition-all">
              <div className="flex bg-[#050B14]/95 rounded-[15px] items-center px-4 py-2">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="What is your presentation topic?"
                  className="w-full bg-transparent border-0 text-white placeholder-gray-500 focus:outline-none focus:ring-0 py-2.5 text-sm"
                  required
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-primary hover:bg-primary-foreground/10 text-white hover:text-white rounded-xl font-semibold text-xs transition-all duration-150 flex items-center justify-center cursor-pointer gap-2 border border-primary/50"
                >
                  <Sparkles size={14} />
                  Generate
                </button>
              </div>
            </div>

            {/* Options Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-on-surface-variant mb-2 uppercase tracking-wider">Layout Style</label>
                <div className="flex gap-2">
                  {[
                    { id: 'professional', label: 'Professional' },
                    { id: 'traditional', label: 'Traditional' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMode(m.id as 'traditional' | 'professional')}
                      className={`flex-grow py-2 px-4 rounded-xl font-medium text-xs border transition-all ${
                        mode === m.id
                          ? 'bg-primary/20 border-primary text-white shadow-lg shadow-primary/10'
                          : 'bg-white/5 border-white/10 text-on-surface-variant hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant mb-2 uppercase tracking-wider">AI Model</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-[#020617] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4] transition-all text-xs h-[34px] font-medium"
                >
                  <option value="google/gemini-2.5-flash">Gemini Flash</option>
                  <option value="google/gemini-2.5-pro">Gemini Pro</option>
                  <option value="anthropic/claude-3-5-sonnet">Claude Sonnet</option>
                  <option value="meta-llama/llama-3.3-70b-instruct">Llama 3.3</option>
                </select>
              </div>
            </div>

          </form>

          {/* Popular Starting Points */}
          <div className="pt-2 border-t border-white/5">
            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-3">Popular starting points</p>
            <div className="flex flex-wrap gap-2">
              {examples.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setTopic(ex)}
                  className="px-3.5 py-1.5 text-xs font-medium bg-white/5 hover:bg-white/10 text-on-surface-variant hover:text-white rounded-lg border border-white/10 transition-all cursor-pointer"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Hero Right: Glass Dashboard Frame */}
        <div className="lg:col-span-6 w-full flex items-center justify-center relative">
          <div className="glass-panel w-full aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl p-2 flex flex-col bg-white/5 relative z-10 border border-white/10">
            {/* Browser Header Chrome */}
            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/5 bg-[#060e20]/50 rounded-t-xl shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-white/20"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-white/20"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-white/20"></div>
            </div>
            
            {/* Browser Body / Image Workspace */}
            <div className="flex-grow bg-[#050B14] rounded-b-xl overflow-hidden relative group">
              <img 
                alt="AI Network Visualization" 
                className="w-full h-full object-cover opacity-60 mix-blend-screen transition-transform duration-700 group-hover:scale-105" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDoPI-OouUFg-h5MISZZZ0mhgfXvvfbkBZXBvMD-32ZG3YVfpKN8TsubiGj7W-ZGeBbvrYE4k4fGo6xVKQR7Gsf3tHWmpxG7qfP3DmrDlDg0gl2iPmmaseMLsYSk_40R1qnMC_1N7YMdYWwgmHtcfOardBk905BOC6c2cpefqCRHw456DpUE-Zb5_-IR4xn6aPDCKi6p5eHTUkn0qiIrZwgF6w5y0vH6QGBuceVJbvdw-uEc3mGY6UWQlfFv8kk_M9gt-qj7FtICDY" 
              />
              
              {/* Floating UI Elements over image */}
              <div className="absolute bottom-6 left-6 right-6 glass-panel rounded-xl p-4 flex items-center justify-between border border-white/10 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#06b6d4]/20 border border-[#06b6d4]/30 text-[#06b6d4] flex items-center justify-center shrink-0">
                    <Sparkles size={14} className="animate-spin-slow" />
                  </div>
                  <div>
                    <p className="font-medium text-xs text-white">Generating Slide 4...</p>
                    <div className="w-24 h-1 bg-white/10 mt-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-[#06b6d4] w-2/3 rounded-full"></div>
                    </div>
                  </div>
                </div>
                <span className="font-code text-xs text-[#06b6d4]">78%</span>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* Smart Features Section */}
      <section className="py-24 relative z-10 border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl font-extrabold text-white mb-3 tracking-tight">Smart Features</h2>
          <p className="text-sm text-on-surface-variant max-w-lg mx-auto">Everything you need to create compelling narratives at the speed of thought.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="glass-panel p-8 rounded-2xl glass-card-hover border border-white/10 flex flex-col gap-4 group">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors border border-white/5 shrink-0">
              <Layers size={22} />
            </div>
            <h3 className="font-display font-bold text-lg text-white">Auto-Layout Engine</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Intelligently arranges your content, images, and data points into mathematically perfect, beautiful slide compositions.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel p-8 rounded-2xl glass-card-hover border border-white/10 flex flex-col gap-4 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-[#06b6d4] group-hover:bg-[#06b6d4]/10 transition-colors border border-white/5 shrink-0 z-10">
              <Cpu size={22} />
            </div>
            <h3 className="font-display font-bold text-lg text-white z-10">AI Content Generation</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed z-10">
              Expand bullet points into persuasive copy, generate speaker notes, and suggest compelling imagery with a single click.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel p-8 rounded-2xl glass-card-hover border border-white/10 flex flex-col gap-4 group">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-[#ffafd3] group-hover:bg-[#ffafd3]/10 transition-colors border border-white/5 shrink-0">
              <Users size={22} />
            </div>
            <h3 className="font-display font-bold text-lg text-white">Real-time Collaboration</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Work seamlessly with your team in real-time. Leave comments, assign tasks, and watch presentations evolve together.
            </p>
          </div>
        </div>
      </section>

      {/* Simple Pricing Section */}
      <section className="py-24 relative z-10 border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl font-extrabold text-white mb-3 tracking-tight">Simple Pricing</h2>
          <p className="text-sm text-on-surface-variant max-w-lg mx-auto">Start for free, scale when you need to.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
          {/* Tier 1: Free */}
          <div className="glass-panel p-8 rounded-2xl border border-white/10 flex flex-col h-full bg-white/5">
            <h3 className="font-display font-bold text-lg text-white mb-1">Free</h3>
            <div className="font-display text-4xl font-extrabold text-white mb-6">$0<span className="text-xs text-on-surface-variant font-normal">/mo</span></div>
            <ul className="flex flex-col gap-4 mb-8 flex-grow">
              <li className="flex items-center gap-2.5 text-xs text-on-surface-variant">
                <Check size={14} className="text-primary shrink-0" />
                10 AI presentations / mo
              </li>
              <li className="flex items-center gap-2.5 text-xs text-on-surface-variant">
                <Check size={14} className="text-primary shrink-0" />
                Basic layouts and styles
              </li>
              <li className="flex items-center gap-2.5 text-xs text-on-surface-variant">
                <Check size={14} className="text-primary shrink-0" />
                Export to PDF format
              </li>
            </ul>
            <button className="w-full py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-white text-xs font-semibold">
              Get Started
            </button>
          </div>

          {/* Tier 2: Pro */}
          <div className="glass-panel p-8 rounded-2xl border-2 border-primary flex flex-col h-full bg-surface-container-low/85 relative shadow-xl shadow-primary/10">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">
              Most Popular
            </div>
            <h3 className="font-display font-bold text-lg text-white mb-1">Pro</h3>
            <div className="font-display text-4xl font-extrabold text-primary mb-6">$29<span className="text-xs text-on-surface-variant font-normal text-white">/mo</span></div>
            <ul className="flex flex-col gap-4 mb-8 flex-grow">
              <li className="flex items-center gap-2.5 text-xs text-white">
                <Check size={14} className="text-primary shrink-0" />
                Unlimited presentations
              </li>
              <li className="flex items-center gap-2.5 text-xs text-white">
                <Check size={14} className="text-primary shrink-0" />
                Premium auto-layouts
              </li>
              <li className="flex items-center gap-2.5 text-xs text-white">
                <Check size={14} className="text-primary shrink-0" />
                Custom brand assets
              </li>
              <li className="flex items-center gap-2.5 text-xs text-white">
                <Check size={14} className="text-primary shrink-0" />
                Export to editable PPTX
              </li>
            </ul>
            <button className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white text-xs font-semibold shadow-lg shadow-primary/20">
              Upgrade to Pro
            </button>
          </div>

          {/* Tier 3: Enterprise */}
          <div className="glass-panel p-8 rounded-2xl border border-white/10 flex flex-col h-full bg-white/5">
            <h3 className="font-display font-bold text-lg text-white mb-1">Enterprise</h3>
            <div className="font-display text-4xl font-extrabold text-white mb-6">Custom</div>
            <ul className="flex flex-col gap-4 mb-8 flex-grow">
              <li className="flex items-center gap-2.5 text-xs text-on-surface-variant">
                <Check size={14} className="text-[#06b6d4] shrink-0" />
                Everything in Pro
              </li>
              <li className="flex items-center gap-2.5 text-xs text-on-surface-variant">
                <Check size={14} className="text-[#06b6d4] shrink-0" />
                Dedicated success manager
              </li>
              <li className="flex items-center gap-2.5 text-xs text-on-surface-variant">
                <Check size={14} className="text-[#06b6d4] shrink-0" />
                SSO and custom integration
              </li>
            </ul>
            <button className="w-full py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-white text-xs font-semibold">
              Contact Sales
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
