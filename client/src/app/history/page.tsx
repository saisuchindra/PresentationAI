'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { generatePPTX, Presentation } from '../../lib/pptx';
import { Download, Trash2, Calendar, Sparkles, Layers, Cpu, BookOpen } from 'lucide-react';

export default function HistoryPage() {
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const fetchPresentations = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('http://localhost:5000/api/presentations');
      if (res.ok) {
        const data = await res.json();
        setPresentations(data);
      } else {
        setError('Failed to load presentation history.');
      }
    } catch (err) {
      console.error(err);
      setError('Could not connect to server. Ensure Express backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPresentations();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleDownload = async (pres: Presentation) => {
    try {
      setDownloadingId(pres.id);
      await generatePPTX(pres);
    } catch (err) {
      console.error(err);
      alert('Error generating PowerPoint file.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this presentation from your history?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/presentations/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setPresentations(presentations.filter((p) => p.id !== id));
      } else {
        alert('Failed to delete presentation.');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting presentation.');
    }
  };

  // Get a category icon for display on the card based on title
  const getCardIcon = (topic: string) => {
    const t = topic.toLowerCase();
    if (t.includes('ai') || t.includes('intelligence') || t.includes('neural')) {
      return <Cpu size={18} />;
    }
    if (t.includes('learn') || t.includes('data') || t.includes('science')) {
      return <Layers size={18} />;
    }
    return <BookOpen size={18} />;
  };

  if (loading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-16 relative z-10">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-on-surface-variant text-sm font-light">Loading generation history...</p>
      </div>
    );
  }

  return (
    <div className="flex-grow py-6 relative z-10">
      
      {/* Header */}
      <header className="mb-12">
        <h1 className="font-display font-extrabold text-3xl md:text-4xl text-white mb-2 tracking-tight">Presentation History</h1>
        <p className="text-sm text-on-surface-variant max-w-xl font-light">Previously generated presentations. You can download or delete them here.</p>
      </header>

      {error && (
        <div className="p-4 bg-rose-950/20 border border-rose-500/20 text-rose-300 rounded-xl mb-8 text-xs font-medium max-w-2xl">
          {error}
        </div>
      )}

      {presentations.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center border border-white/10 max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
            <Sparkles size={24} className="text-on-surface-variant" />
          </div>
          <h3 className="text-base font-display font-bold text-white mb-2">No Presentations Found</h3>
          <p className="text-on-surface-variant text-xs mb-6 max-w-sm mx-auto font-light leading-relaxed">
            You haven&apos;t generated any presentations yet. Enter a topic on the home screen to start.
          </p>
          <Link
            href="/"
            className="inline-flex px-5 py-2.5 bg-primary hover:bg-primary/95 text-white rounded-xl font-semibold text-xs shadow-lg shadow-primary/20 transition-all"
          >
            Create Your First Presentation
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {presentations.map((pres) => (
            <div 
              key={pres.id} 
              className="glass-panel glass-card-hover rounded-xl p-6 flex flex-col justify-between h-56 relative overflow-hidden group"
            >
              {/* Top gradient border accent */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-[#06b6d4] opacity-50 group-hover:opacity-100 transition-opacity"></div>
              
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-white/5 p-2.5 rounded-lg border border-white/10 text-primary">
                    {getCardIcon(pres.topic)}
                  </div>
                  <span className="bg-primary/10 text-primary border border-primary/20 font-code px-2 py-0.5 rounded-full text-[10px] font-bold">
                    {pres.slides?.length || 0} Slides
                  </span>
                </div>

                <h3 className="font-display font-bold text-lg text-white mb-1.5 line-clamp-1 group-hover:text-primary transition-colors">
                  {pres.topic}
                </h3>
                
                <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-light mb-1">
                  <Calendar size={12} />
                  <span>
                    {new Date(pres.createdAt || '').toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                
                <p className="text-[10px] text-on-surface-variant/70 font-code truncate">
                  Model: {pres.model?.split('/')?.pop() || 'AI Model'}
                </p>
              </div>

              <div className="flex gap-3 mt-4 pt-4 border-t border-white/5">
                <button
                  onClick={() => handleDownload(pres)}
                  disabled={downloadingId === pres.id}
                  className="flex-grow flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs py-2 px-3 rounded-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {downloadingId === pres.id ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download size={14} className="text-primary" />
                      Download PPTX
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleDelete(pres.id)}
                  className="flex items-center justify-center bg-white/5 hover:bg-rose-950/20 border border-white/10 hover:border-rose-500/20 text-on-surface-variant hover:text-rose-400 py-2 px-3 rounded-lg transition-colors active:scale-95 cursor-pointer"
                  title="Delete Presentation"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
