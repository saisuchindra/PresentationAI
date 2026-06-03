'use client';

import React, { useState, useEffect } from 'react';
import { generatePPTX, Presentation } from '../../lib/pptx';

export default function HistoryPage() {
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPresentations();
  }, []);

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

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-16">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-400 text-sm">Loading history...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 py-6">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl tracking-tight text-white mb-2">History</h1>
        <p className="text-gray-400">Previously generated presentations. You can download or delete them here.</p>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/30 border border-rose-500/20 text-rose-300 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      {presentations.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-white/5">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <h3 className="text-lg font-display font-semibold text-white mb-2">No Presentations Found</h3>
          <p className="text-gray-400 mb-6 text-sm max-w-md mx-auto">
            You haven't generated any presentations yet. Enter a topic on the home screen to start.
          </p>
          <a
            href="/"
            className="inline-flex px-5 py-2.5 bg-gradient-to-r from-primary to-accent hover:from-primary/95 text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-primary/20"
          >
            Create Your First Presentation
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {presentations.map((pres) => (
            <div key={pres.id} className="glass-card rounded-2xl border border-white/5 overflow-hidden flex flex-col justify-between h-56">
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full ${
                    pres.mode === 'professional' 
                      ? 'bg-primary/20 text-primary-foreground border border-primary/30'
                      : 'bg-accent/20 text-accent-foreground border border-accent/30'
                  }`}>
                    {pres.mode}
                  </span>
                  <span className="text-[11px] text-gray-500">
                    {new Date(pres.createdAt || '').toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg text-white mb-2 line-clamp-1">{pres.topic}</h3>
                <p className="text-gray-400 text-xs line-clamp-2">{pres.slides?.[0]?.title || 'Slides layout'}</p>
                <div className="text-gray-500 text-[10px] mt-3">
                  {pres.slides?.length || 0} slides • Model: {pres.model?.split('/')?.pop() || 'AI Model'}
                </div>
              </div>

              <div className="p-4 bg-black/20 border-t border-white/5 flex gap-2 justify-end">
                <button
                  onClick={() => handleDelete(pres.id)}
                  className="p-2 text-gray-400 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition-all"
                  title="Delete"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDownload(pres)}
                  disabled={downloadingId === pres.id}
                  className="flex-1 py-1.5 bg-secondary text-white hover:bg-white/5 rounded-xl font-medium text-xs border border-white/5 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  {downloadingId === pres.id ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download PPTX
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
