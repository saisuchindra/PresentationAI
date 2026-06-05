'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { generatePPTX, Presentation } from '../../lib/pptx';
import { 
  Sparkles, 
  Download, 
  Trash2, 
  Plus, 
  FileText, 
  TrendingUp, 
  Table as TableIcon, 
  Quote as QuoteIcon
} from 'lucide-react';

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

  // AI Prompt Bar State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);

  const startGeneration = React.useCallback(() => {
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

    es.addEventListener('error', (e) => {
      try {
        let errMsg = 'API key issue or connection error. Make sure OpenRouter key is configured in settings.';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const errEvent = e as any;
        if (errEvent.data) {
          const data = JSON.parse(errEvent.data);
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
  }, [topic, mode, model]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (topic) {
        startGeneration();
      } else {
        setError('No topic provided. Please return to the Home page.');
      }
    }, 0);

    return () => {
      clearTimeout(timer);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [topic, startGeneration]);

  // Sync edit forms when slide selection changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (presentation && presentation.slides[selectedSlideIndex]) {
        const slide = presentation.slides[selectedSlideIndex];
        setEditTitle(slide.title);
        setEditBullets(slide.bullets || []);
        setEditQuote(slide.quote || '');
        setEditQuoteAuthor(slide.quoteAuthor || '');
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [selectedSlideIndex, presentation]);

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

  const changeSlideType = (newType: 'content' | 'quote' | 'chart' | 'table') => {
    if (!presentation) return;

    const updatedSlides = [...presentation.slides];
    const currentSlide = updatedSlides[selectedSlideIndex];

    // Initialize mock data if switching to chart or table
    let mockChartData = currentSlide.chartData;
    if (newType === 'chart' && !mockChartData) {
      mockChartData = [
        { label: 'Q1', value: 30 },
        { label: 'Q2', value: 55 },
        { label: 'Q3', value: 85 },
        { label: 'Q4', value: 45 }
      ];
    }

    let mockTableData = currentSlide.tableData;
    if (newType === 'table' && !mockTableData) {
      mockTableData = [
        ['Metric', 'Value', 'Growth'],
        ['Data Flow', '180 ZB', '+25%'],
        ['AI Adoption', '72%', '+12%'],
        ['Automation', '95%', '+40%']
      ];
    }

    updatedSlides[selectedSlideIndex] = {
      ...currentSlide,
      type: newType,
      chartData: mockChartData,
      tableData: mockTableData,
    };

    setPresentation({
      ...presentation,
      slides: updatedSlides,
    });
  };

  const handleAiRefinementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim() || !presentation) return;

    setIsAiGenerating(true);

    // Simulate AI refinement locally to make it feel extremely responsive and alive
    setTimeout(() => {
      const updatedSlides = [...presentation.slides];
      const currentSlide = updatedSlides[selectedSlideIndex];

      if (aiPrompt.toLowerCase().includes('simplify') || aiPrompt.toLowerCase().includes('shorten')) {
        // Simplify bullets
        const simplified = editBullets.map(b => b.length > 30 ? b.substring(0, 30) + '...' : b);
        setEditBullets(simplified);
        updatedSlides[selectedSlideIndex] = {
          ...currentSlide,
          bullets: simplified,
        };
      } else if (aiPrompt.toLowerCase().includes('capitalize') || aiPrompt.toLowerCase().includes('uppercase')) {
        const uppercaseTitle = editTitle.toUpperCase();
        setEditTitle(uppercaseTitle);
        updatedSlides[selectedSlideIndex] = {
          ...currentSlide,
          title: uppercaseTitle,
        };
      } else {
        // Append refinement result as a bullet
        const newBullets = [...editBullets, `AI: ${aiPrompt}`].slice(0, 5);
        setEditBullets(newBullets);
        updatedSlides[selectedSlideIndex] = {
          ...currentSlide,
          bullets: newBullets,
        };
      }

      setPresentation({
        ...presentation,
        slides: updatedSlides,
      });

      setIsAiGenerating(false);
      setAiPrompt('');
    }, 1500);
  };

  // Rendering loading panel
  if (loading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center max-w-2xl mx-auto py-12 w-full relative z-10">
        <div className="glass-panel w-full p-8 rounded-2xl border border-white/10 text-center space-y-6 relative overflow-hidden bg-white/5 shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
          
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-accent border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-display font-bold text-xl text-white">Generating Slide Deck</h3>
            <p className="text-on-surface-variant text-sm font-light">Researching your topic and composing structured outlines...</p>
            <p className="text-primary font-semibold text-xs animate-pulse tracking-wide mt-2">
              {currentStep || 'Initializing connection...'}
            </p>
          </div>

          {/* Terminal Console Logs */}
          <div className="bg-black/60 rounded-xl p-4 text-left font-code text-[11px] text-[#4cd7f6] h-48 overflow-y-auto space-y-1.5 border border-white/5 custom-scrollbar">
            {logs.map((log, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-white/30 select-none">&gt;</span>
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
      <div className="flex-grow flex flex-col items-center justify-center max-w-md mx-auto py-12 relative z-10">
        <div className="glass-panel w-full p-8 rounded-2xl border border-rose-500/20 text-center space-y-6 bg-rose-950/10 shadow-2xl">
          <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
            <svg className="w-8 h-8 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-display font-bold text-lg text-white">Generation Failed</h3>
            <p className="text-on-surface-variant text-xs leading-relaxed font-light">{error}</p>
          </div>
          
          <div className="flex gap-3">
            <a
              href="/settings"
              className="flex-grow py-2.5 bg-white/5 text-on-surface-variant hover:text-white rounded-xl text-xs font-semibold border border-white/10 text-center hover:bg-white/10"
            >
              Configure Settings
            </a>
            <button
              onClick={() => router.push('/')}
              className="flex-grow py-2.5 bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-semibold shadow-lg shadow-primary/20"
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
    <div className="flex-1 flex flex-col lg:flex-row gap-6 py-4 h-[calc(100vh-140px)] overflow-hidden relative z-10">
      
      {/* 1. Left Sidebar: Deck Outline */}
      <aside className="w-full lg:w-64 glass-panel rounded-2xl flex flex-col h-full overflow-hidden bg-white/5 border border-white/10">
        <div className="p-4 border-b border-white/10 flex justify-between items-center shrink-0">
          <div>
            <h3 className="font-display font-bold text-sm text-white">Slide Outline</h3>
            <p className="text-[10px] text-on-surface-variant mt-0.5">{presentation.slides.length} slides • {presentation.mode} mode</p>
          </div>
        </div>
        
        <div className="flex-grow overflow-y-auto custom-scrollbar p-3 space-y-3">
          {presentation.slides.map((s, idx) => (
            <button
              key={s.id || idx}
              onClick={() => setSelectedSlideIndex(idx)}
              className={`w-full text-left p-2 rounded-xl transition-all cursor-pointer flex flex-col ${
                idx === selectedSlideIndex
                  ? 'border border-primary bg-primary/10 shadow-lg shadow-primary/5'
                  : 'border border-transparent hover:border-white/10 hover:bg-white/5'
              }`}
            >
              <span className={`text-[10px] font-code mb-1 ${idx === selectedSlideIndex ? 'text-primary' : 'text-on-surface-variant'}`}>
                {String(idx + 1).padStart(2, '0')}
              </span>
              <div className={`text-xs font-medium truncate w-full ${idx === selectedSlideIndex ? 'text-white' : 'text-on-surface-variant'}`}>
                {s.title}
              </div>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-white/10 shrink-0">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full py-2.5 bg-primary hover:bg-primary/95 text-white rounded-xl font-semibold text-xs shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {exporting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Exporting...
              </>
            ) : (
              <>
                <Download size={14} />
                Export PowerPoint
              </>
            )}
          </button>
        </div>
      </aside>

      {/* 2. Middle Panel: Live Slide Canvas */}
      <section className="flex-grow flex flex-col gap-6 h-full justify-between">
        
        {/* Slide Frame Container */}
        <div className="flex-grow glass-panel rounded-2xl overflow-hidden flex items-center justify-center p-6 bg-black/30 border border-white/10 relative">
          {/* Ambient Glow behind slide */}
          <div className="absolute w-[500px] h-[300px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

          {/* 16:9 Presentation Slide Canvas */}
          <div 
            className={`w-full max-w-[800px] aspect-[16/9] rounded-xl shadow-2xl p-10 flex flex-col justify-between border relative overflow-hidden transition-all ${
              presentation.mode === 'professional' 
                ? 'bg-gradient-to-br from-[#0f172a] to-[#020617] border-white/10 text-white' 
                : 'bg-white border-gray-200 text-gray-800'
            }`}
          >
            {currentSlide.type === 'title' ? (
              /* Title Slide Layout */
              <div className="flex-1 flex flex-col justify-center relative pl-6">
                {presentation.mode === 'professional' && (
                  <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-primary rounded-full shadow-[0_0_10px_#8b5cf6]"></div>
                )}
                
                <h1 className={`font-display font-extrabold text-3xl md:text-4xl leading-tight ${
                  presentation.mode === 'professional' ? 'text-white' : 'text-gray-900'
                }`}>
                  {currentSlide.title}
                </h1>
                
                <p className={`text-sm mt-3 font-light ${
                  presentation.mode === 'professional' ? 'text-on-surface-variant' : 'text-gray-500'
                }`}>
                  {currentSlide.bullets?.[0] || 'Presentation Subtitle'}
                </p>
                
                <div className={`mt-8 text-[10px] font-code ${
                  presentation.mode === 'professional' ? 'text-primary' : 'text-gray-400'
                }`}>
                  Topic: {presentation.topic} • AI Generated
                </div>
              </div>
            ) : currentSlide.type === 'quote' ? (
              /* Quote Slide Layout */
              <div className="flex-grow flex flex-col justify-center items-center text-center px-8 relative h-full">
                <span className="text-5xl font-serif text-primary absolute left-6 top-6 select-none opacity-50 font-extrabold">“</span>
                <p className="text-base italic font-medium leading-relaxed max-w-xl">
                  {currentSlide.quote || currentSlide.bullets?.[0] || 'Key quote or stat description...'}
                </p>
                {currentSlide.quoteAuthor && (
                  <p className="text-xs text-[#06b6d4] font-bold mt-4 tracking-wide uppercase">— {currentSlide.quoteAuthor}</p>
                )}
              </div>
            ) : (
              /* Standard Content / Table / Chart Layout */
              <div className="flex-grow flex flex-col h-full justify-start">
                {/* Title header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-6">
                  <h2 className="font-display font-bold text-lg text-white">
                    {currentSlide.title}
                  </h2>
                  <span className="text-[10px] font-code text-primary uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                    {currentSlide.type}
                  </span>
                </div>

                <div className="flex-grow grid grid-cols-1 md:grid-cols-12 gap-8 items-center h-full">
                  
                  {/* Left Column: Bullets list (Spans 7 columns) */}
                  <div className="md:col-span-7 space-y-4">
                    {currentSlide.bullets && currentSlide.bullets.map((bullet, bIdx) => (
                      <div key={bIdx} className="flex items-start gap-3 text-xs">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#06b6d4] shrink-0 shadow-[0_0_8px_rgba(6,182,212,0.6)]"></div>
                        <p className={presentation.mode === 'professional' ? 'text-on-surface-variant font-light' : 'text-gray-700'}>
                          {bullet}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Right Column: Visual support (Spans 5 columns) */}
                  <div className="md:col-span-5 h-full flex items-center justify-center">
                    {currentSlide.type === 'chart' && currentSlide.chartData && (
                      <div className="w-full flex flex-col gap-2 p-3 bg-black/30 rounded-xl border border-white/5">
                        <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider text-center">
                          PowerPoint {currentSlide.chartType || 'bar'} Chart
                        </p>
                        <div className="h-28 flex items-end justify-between px-2 pb-1 border-b border-white/10 gap-2 mt-2">
                          {currentSlide.chartData.map((d, cIdx) => (
                            <div key={cIdx} className="flex flex-col items-center flex-1 gap-1">
                              <span className="text-[8px] text-on-surface-variant font-code">{d.value}</span>
                              <div 
                                className="w-full bg-gradient-to-t from-primary/30 to-primary rounded-t-sm transition-all"
                                style={{ height: `${Math.max(15, Math.min(100, (d.value / Math.max(...currentSlide.chartData!.map(i => i.value))) * 80))}%` }}
                              ></div>
                              <span className="text-[8px] text-on-surface-variant truncate w-8 text-center">{d.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {currentSlide.type === 'table' && currentSlide.tableData && (
                      <div className="w-full overflow-hidden border border-white/10 rounded-lg text-[10px] bg-black/20">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-primary/20 border-b border-white/10">
                              {currentSlide.tableData[0]?.map((header, hIdx) => (
                                <th key={hIdx} className="p-2 font-bold text-white text-[9px] uppercase tracking-wider">{header}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {currentSlide.tableData.slice(1).map((row, rIdx) => (
                              <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white/5' : 'bg-transparent'}>
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="p-2 border-b border-white/5 text-on-surface-variant font-light">{cell}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {currentSlide.type === 'content' && currentSlide.image?.url && (
                      <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-white/10 shadow-lg">
                        <img 
                          src={currentSlide.image.url} 
                          alt={currentSlide.image.description} 
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute bottom-0 inset-x-0 bg-black/70 p-1 text-[8px] text-on-surface-variant text-right truncate">
                          Photo by {currentSlide.image.photographer} via Unsplash
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}
            
            {/* Slide Footer */}
            <div className="flex items-center justify-between text-[9px] text-on-surface-variant/60 pt-2 border-t border-white/5 mt-auto">
              <span>{presentation.topic}</span>
              <span className="font-code">Slide {selectedSlideIndex + 1} of {presentation.slides.length}</span>
            </div>
          </div>

        </div>

        {/* Floating AI Prompt Refiner Toolbar */}
        <form onSubmit={handleAiRefinementSubmit} className="glass-panel rounded-full p-1.5 flex items-center gap-3 shadow-lg border border-white/10 w-full max-w-2xl mx-auto shrink-0 relative">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-[#06b6d4] flex items-center justify-center shrink-0 ml-1">
            <Sparkles size={14} className={`text-white ${isAiGenerating ? 'animate-spin' : ''}`} />
          </div>
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            disabled={isAiGenerating}
            placeholder="Ask AI to simplify bullets, capitalize title, or rewrite..."
            className="flex-grow bg-transparent border-none text-xs text-white placeholder-white/30 focus:ring-0 focus:outline-none py-2 px-1"
          />
          <button
            type="submit"
            disabled={isAiGenerating || !aiPrompt.trim()}
            className="bg-primary/20 hover:bg-primary/30 text-white rounded-full px-4 py-1.5 text-xs font-semibold transition-colors border border-primary/20 mr-1 disabled:opacity-40 cursor-pointer"
          >
            {isAiGenerating ? 'Generating...' : 'Refine'}
          </button>
        </form>

      </section>

      {/* 3. Right Sidebar: Slide Editor */}
      <aside className="w-full lg:w-80 glass-panel rounded-2xl p-5 flex flex-col h-full overflow-hidden bg-white/5 border border-white/10 justify-between shrink-0">
        <div className="space-y-5 flex-grow overflow-y-auto custom-scrollbar pr-1">
          <div className="border-b border-white/10 pb-3 flex items-center justify-between">
            <h3 className="font-display font-semibold text-sm text-white">Edit Slide</h3>
            <span className="text-[10px] text-on-surface-variant font-code uppercase">Active Slide</span>
          </div>

          {/* Title Edit */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Slide Title</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full bg-[#020617] border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4] transition-all"
            />
          </div>

          {/* Quote Editor inputs */}
          {currentSlide.type === 'quote' && (
            <>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Quote Text</label>
                <textarea
                  value={editQuote}
                  onChange={(e) => setEditQuote(e.target.value)}
                  rows={4}
                  className="w-full bg-[#020617] border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4] transition-all resize-none custom-scrollbar"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Citation/Author</label>
                <input
                  type="text"
                  value={editQuoteAuthor}
                  onChange={(e) => setEditQuoteAuthor(e.target.value)}
                  className="w-full bg-[#020617] border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4] transition-all"
                />
              </div>
            </>
          )}

          {/* Bullets Edit */}
          {currentSlide.type !== 'quote' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Bullet Points</label>
                {editBullets.length < 5 && (
                  <button onClick={addBullet} className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5">
                    <Plus size={10} /> Add Point
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                {editBullets.map((bullet, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={bullet}
                      onChange={(e) => handleBulletChange(idx, e.target.value)}
                      className="flex-grow bg-[#020617] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4] transition-all"
                    />
                    <button
                      onClick={() => removeBullet(idx)}
                      className="p-1.5 text-on-surface-variant hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Layout Style Selectors */}
          <div className="pt-4 border-t border-white/10 space-y-2.5">
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Layout Style</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { type: 'content', icon: <FileText size={16} />, label: 'Text' },
                { type: 'quote', icon: <QuoteIcon size={16} />, label: 'Quote' },
                { type: 'chart', icon: <TrendingUp size={16} />, label: 'Chart' },
                { type: 'table', icon: <TableIcon size={16} />, label: 'Table' },
              ].map((style) => (
                <button
                  key={style.type}
                  type="button"
                  onClick={() => changeSlideType(style.type as 'content' | 'quote' | 'chart' | 'table')}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                    currentSlide.type === style.type
                      ? 'border-primary bg-primary/10 text-white shadow-md'
                      : 'border-white/5 bg-white/5 text-on-surface-variant hover:text-white hover:bg-white/10'
                  }`}
                  title={`Switch to ${style.label} layout`}
                >
                  {style.icon}
                  <span className="text-[8px] font-medium font-code">{style.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleUpdateSlide}
          className="w-full py-3 bg-primary hover:bg-primary/95 text-white rounded-xl font-bold text-xs shadow-lg shadow-primary/20 transition-all cursor-pointer shrink-0 mt-4 border border-primary/50"
        >
          Apply Changes
        </button>
      </aside>

    </div>
  );
}

export default function GeneratorPage() {
  return (
    <Suspense fallback={
      <div className="flex-grow flex flex-col items-center justify-center py-12 max-w-md mx-auto relative z-10">
        <div className="glass-panel w-full p-8 rounded-2xl border border-white/10 text-center space-y-6">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-on-surface-variant text-sm font-light">Initializing presentation generator...</p>
        </div>
      </div>
    }>
      <GeneratorPageContent />
    </Suspense>
  );
}
