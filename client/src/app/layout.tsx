import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PresentationAI | Professional AI PowerPoint Generator',
  description: 'Generate editable, high-quality, research-backed presentation decks in seconds. Built for students, academics, and business professionals.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans selection:bg-primary/30 selection:text-white">
        
        {/* Navigation Bar */}
        <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-white font-display font-extrabold text-xl">P</span>
              </div>
              <a href="/" className="font-display font-bold text-xl tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent hover:to-white transition-all">
                Presentation<span className="text-primary font-extrabold">AI</span>
              </a>
            </div>

            <nav className="flex gap-1 sm:gap-4">
              <a href="/" className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all">
                Home
              </a>
              <a href="/generator" className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all">
                Generator
              </a>
              <a href="/history" className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all">
                History
              </a>
              <a href="/settings" className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all">
                Settings
              </a>
            </nav>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-white/5 py-6 bg-background/50">
          <div className="max-w-7xl mx-auto px-4 text-center text-xs text-gray-500">
            &copy; {new Date().getFullYear()} PresentationAI. All rights reserved. Professional, research-backed slide generation.
          </div>
        </footer>
      </body>
    </html>
  );
}
