'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { generatePPTX, Presentation, SlideContent } from '../../lib/pptx';

function GeneratorPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const topic = searchParams.get('topic') || '';
  const mode = (searchParams.get('mode') as 'traditional' | 'professional') || 'professional';
  const model = searchParams.get('model') || 'google/gemini-2.5-flash';

  const [logs, setLogs] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const [exporting, setExporting] = useState(false);
  
  // Slide edit fields
  const [editTitle, setEditTitle] = useState('');
  const [editBullets, setEditBullets] = useState<string[]>([]);
  const [editQuote, setEditQuote] = useState('');
  const [editQuoteAuthor, setEditQuoteAuthor] = useState('');

  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (topic) {
      startGeneration();
    } else {
      setError('No topic provided. Please return to the Home page.');
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [topic]);

  // Sync edit forms when slide selection changes
  useEffect(() => {
    if (presentation && presentation.slides[selectedSlideIndex]) {
      const slide = presentation.slides[selectedSlideIndex];
      setEditTitle(slide.title);
      setEditBullets(slide.bullets || []);
      setEditQuote(slide.quote || '');
      setEditQuoteAuthor(slide.quoteAuthor || '');
    }
  }, [selectedSlideIndex, presentation]);

  const startGeneration = () => {
    setLoading(true);
    setError('');
    setLogs([]);
    setPresentation(null);
    setSelectedSlideIndex(0);

    const url = `http://localhost:5000/api/generate?topic=${encodeURIComponent(topic)}&mode=${mode}&model=${model}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.addEventListener('progress', (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.message) {
          setCurrentStep(data.message);
          setLogs((prev) => [...prev, data.message]);
        }
      } catch (err) {
        console.error(err);
      }
    });

    es.addEventListener('result', (e) => {
      try {
        const data = JSON.parse(e.data) as Presentation;
        setPresentation(data);
        setLogs((prev) => [...prev, 'Presentation created successfully!']);
        setLoading(false);
        es.close();
      } catch (err) {
        console.error(err);
        setError('Failed to parse generated presentation data.');
        setLoading(false);
        es.close();
      }
    });

    es.addEventListener('error', (e: any) => {
      try {
        // SSE errors trigger this event, sometimes e.data is undefined
        let errMsg = 'API key issue or connection error. Make sure OpenRouter key is configured in settings.';
        if (e.data) {
          const data = JSON.parse(e.data);
          errMsg = data.message || errMsg;
        }
        setError(errMsg);
      } catch (err) {
        console.error(err);
        setError('An unexpected server error occurred.');
      } finally {
        setLoading(false);
        es.close();
      }
    });
  };

  const handleUpdateSlide = () => {
    if (!presentation) return;
    
    const updatedSlides = [...presentation.slides];
    updatedSlides[selectedSlideIndex] = {
      ...updatedSlides[selectedSlideIndex],
      title: editTitle,
      bullets: editBullets,
      quote: editQuote,
      quoteAuthor: editQuoteAuthor,
    };

    setPresentation({
      ...presentation,
      slides: updatedSlides,
    });
  };

  const handleBulletChange = (idx: number, val: string) => {
    const updated = [...editBullets];
    updated[idx] = val;
    setEditBullets(updated);
  };

  const addBullet = () => {
    if (editBullets.length >= 5) return;
    setEditBullets([...editBullets, 'New bullet point']);
  };

  const removeBullet = (idx: number) => {
    setEditBullets(editBullets.filter((_, i) => i !== idx));
  };

  const handleExport = async () => {
    if (!presentation) return;
    try {
      setExporting(true);
      await generatePPTX(presentation);
    } catch (err) {
      console.error(err);
      alert('Failed to generate PPTX download.');
    } finally {
      setExporting(false);
    }
  };

  // Rendering loading panel
  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto py-12 w-full">
        <div className="glass-card w-full p-8 rounded-3xl border border-white/10 text-center space-y-6">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-accent animate-spin"></div>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-display font-bold text-xl text-white">Generating Slide Deck</h3>
            <p className="text-gray-400 text-sm">Researching topic and writing content without the slop...</p>
            <p className="text-primary font-semibold text-xs animate-pulse">{currentStep || 'Initializing connection...'}</p>
          </div>

          {/* Terminal Console Logs */}
          <div className="bg-black/60 rounded-xl p-4 text-left font-mono text-xs text-green-400 h-44 overflow-y-auto space-y-1.5 border border-white/5 scrollbar-thin">
            {logs.map((log, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-gray-600 select-none">&gt;</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Rendering error panel
  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto py-12">
        <div className="glass-card w-full p-8 rounded-3xl border border-rose-500/20 text-center space-y-6 bg-rose-950/10">
          <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="font-display font-bold text-lg text-white">Generation Failed</h3>
            <p className="text-gray-400 text-xs leading-relaxed">{error}</p>
          </div>
          <div className="flex gap-3">
            <a
              href="/settings"
              className="flex-1 py-2 bg-secondary text-gray-300 hover:text-white rounded-xl text-xs font-semibold border border-white/5 text-center"
            >
              Configure Settings
            </a>
            <button
              onClick={() => router.push('/')}
              className="flex-1 py-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 text-white rounded-xl text-xs font-semibold"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!presentation) return null;

  const currentSlide = presentation.slides[selectedSlideIndex];

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-6 py-4 h-[calc(100vh-140px)]">
      
      {/* 1. Left Sidebar: Deck Outline */}
      <div className="w-full lg:w-64 glass-panel rounded-2xl border border-white/5 flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <h3 className="font-display font-bold text-sm text-white">Presentation Outline</h3>
          <p className="text-[10px] text-gray-400 mt-0.5">{presentation.slides.length} slides • {presentation.mode} mode</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {presentation.slides.map((s, idx) => (
            <button
              key={s.id || idx}
              onClick={() => setSelectedSlideIndex(idx)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2.5 cursor-pointer ${
                idx === selectedSlideIndex
                  ? 'bg-primary text-white font-semibold'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="w-5 h-5 rounded-md bg-black/30 flex items-center justify-center text-[10px]">
                {idx + 1}
              </span>
              <span className="truncate">{s.title}</span>
            </button>
          ))}
        </div>

        <div className="p-3 border-t border-white/5">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full py-2.5 bg-gradient-to-r from-primary to-accent hover:from-primary/95 text-white rounded-xl font-bold text-xs shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {exporting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Generating PPTX...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export PowerPoint
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Middle Panel: Live PPTX Slide Canvas Simulator */}
      <div className="flex-1 flex flex-col gap-4 h-full">
        <div className="flex-1 glass-panel rounded-3xl border border-white/5 overflow-hidden flex items-center justify-center p-6 bg-black/40 relative">
          
          {/* Simulated 16:9 PowerPoint Slide Frame */}
          <div 
            className={`w-full max-w-[800px] aspect-[16/9] rounded-xl shadow-2xl p-8 flex flex-col justify-between border ${
              presentation.mode === 'professional' 
                ? 'bg-slate-900 border-slate-800 text-slate-100' 
                : 'bg-white border-gray-200 text-gray-800'
            }`}
          >
            {currentSlide.type === 'title' ? (
              /* Title Slide Simulation */
              <div className="flex-1 flex flex-col justify-center relative pl-8">
                {presentation.mode === 'professional' && (
                  <div className="absolute left-0 top-1/4 bottom-1/4 w-1.5 bg-primary rounded-full"></div>
                )}
                
                <h1 className={`font-display font-extrabold text-3xl md:text-4xl leading-tight ${
                  presentation.mode === 'professional' ? 'text-white' : 'text-gray-900 align-center text-center'
                }`}>
                  {currentSlide.title}
                </h1>
                
                <p className={`text-sm mt-3 ${
                  presentation.mode === 'professional' ? 'text-slate-400' : 'text-gray-500 align-center text-center'
                }`}>
                  {currentSlide.bullets?.[0] || 'Presentation Subtitle'}
                </p>
                
                <div className={`mt-8 text-[10px] ${
                  presentation.mode === 'professional' ? 'text-primary' : 'text-gray-400 align-center text-center'
                }`}>
                  Topic: {presentation.topic} • AI Generated
                </div>
              </div>
            ) : currentSlide.type === 'quote' ? (
              /* Quote Slide Simulation */
              <div className="flex-1 flex flex-col justify-center items-center text-center px-8 relative">
                <span className="text-4xl font-serif text-primary absolute left-6 top-8">“</span>
                <p className="text-lg italic font-semibold leading-relaxed max-w-2xl">
                  {currentSlide.quote || currentSlide.bullets?.[0] || 'Key quote or stat description...'}
                </p>
                {currentSlide.quoteAuthor && (
                  <p className="text-xs text-primary font-bold mt-4">— {currentSlide.quoteAuthor}</p>
                )}
              </div>
            ) : (
              /* Standard Content / Table / Chart Simulation */
              <div className="flex-1 flex flex-col">
                {/* Title */}
                <h2 className="font-display font-bold text-xl text-primary border-b border-primary/10 pb-2 mb-4">
                  {currentSlide.title}
                </h2>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  
                  {/* Left Column: Bullets List */}
                  <div className="space-y-2.5">
                    {currentSlide.bullets && currentSlide.bullets.map((bullet, bIdx) => (
                      <div key={bIdx} className="flex items-start gap-2 text-xs">
                        <span className="text-primary mt-0.5 select-none">■</span>
                        <p className={presentation.mode === 'professional' ? 'text-slate-300' : 'text-gray-700'}>
                          {bullet}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Right Column: Dynamic visual support */}
                  <div className="h-full flex items-center justify-center">
                    {currentSlide.type === 'chart' && currentSlide.chartData && (
                      <div className="w-full flex flex-col gap-2 p-3 bg-black/20 rounded-xl border border-white/5">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider text-center">
                          Native PowerPoint {currentSlide.chartType || 'bar'} Chart
                        </p>
                        <div className="h-28 flex items-end justify-between px-4 pb-2 border-b border-white/10 gap-2">
                          {currentSlide.chartData.map((d, cIdx) => (
                            <div key={cIdx} className="flex flex-col items-center flex-1 gap-1">
                              <span className="text-[9px] text-gray-400">{d.value}</span>
                              <div 
                                className="w-full bg-primary rounded-t-sm transition-all"
                                style={{ height: `${Math.max(15, Math.min(100, (d.value / Math.max(...currentSlide.chartData!.map(i => i.value))) * 80))}%` }}
                              ></div>
                              <span className="text-[9px] text-gray-500 truncate w-10 text-center">{d.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {currentSlide.type === 'table' && currentSlide.tableData && (
                      <div className="w-full overflow-hidden border border-white/5 rounded-lg text-[10px]">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-primary/20">
                              {currentSlide.tableData[0]?.map((header, hIdx) => (
                                <th key={hIdx} className="p-2 font-bold text-white border-b border-white/10">{header}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {currentSlide.tableData.slice(1).map((row, rIdx) => (
                              <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white/5' : 'bg-transparent'}>
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="p-2 border-b border-white/5 text-gray-300">{cell}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {currentSlide.type === 'content' && currentSlide.image?.url && (
                      <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-white/10">
                        <img 
                          src={currentSlide.image.url} 
                          alt={currentSlide.image.description} 
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute bottom-0 inset-x-0 bg-black/60 p-1.5 text-[8px] text-gray-400 text-right truncate">
                          Photo by {currentSlide.image.photographer} via Unsplash
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}
            
            {/* Slide Footer */}
            <div className="flex items-center justify-between text-[9px] text-gray-500 pt-2 border-t border-white/5 mt-2">
              <span>{presentation.topic}</span>
              <span>Slide {selectedSlideIndex + 1} of {presentation.slides.length}</span>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Right Panel: Slide Editor */}
      <div className="w-full lg:w-80 glass-panel rounded-2xl border border-white/5 p-4 flex flex-col justify-between h-full overflow-y-auto">
        <div className="space-y-4">
          <div className="border-b border-white/5 pb-2">
            <h3 className="font-display font-semibold text-sm text-white">Slide Editor</h3>
            <p className="text-[10px] text-gray-400">Make immediate inline updates to the slide content.</p>
          </div>

          {/* Title Edit */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Slide Title</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full bg-input border border-border rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary/50"
            />
          </div>

          {/* Quote Edit */}
          {currentSlide.type === 'quote' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Quote Text</label>
                <textarea
                  value={editQuote}
                  onChange={(e) => setEditQuote(e.target.value)}
                  rows={4}
                  className="w-full bg-input border border-border rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary/50 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Citation/Author</label>
                <input
                  type="text"
                  value={editQuoteAuthor}
                  onChange={(e) => setEditQuoteAuthor(e.target.value)}
                  className="w-full bg-input border border-border rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary/50"
                />
              </div>
            </>
          )}

          {/* Bullets Edit */}
          {currentSlide.type !== 'quote' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-gray-400">Bullet Points</label>
                {editBullets.length < 5 && (
                  <button onClick={addBullet} className="text-[10px] font-bold text-accent hover:underline">
                    + Add Point
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {editBullets.map((bullet, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={bullet}
                      onChange={(e) => handleBulletChange(idx, e.target.value)}
                      className="flex-1 bg-input border border-border rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary/50"
                    />
                    <button
                      onClick={() => removeBullet(idx)}
                      className="p-1.5 text-gray-500 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition-all"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleUpdateSlide}
          className="w-full py-2 bg-primary hover:bg-primary/95 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer mt-4"
        >
          Apply Changes
        </button>
      </div>

    </div>
  );
}

export default function GeneratorPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex flex-col items-center justify-center py-12 max-w-md mx-auto">
        <div className="glass-card w-full p-8 rounded-3xl border border-white/10 text-center space-y-6">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400 text-sm">Initializing presentation generator...</p>
        </div>
      </div>
    }>
      <GeneratorPageContent />
    </Suspense>
  );
}
