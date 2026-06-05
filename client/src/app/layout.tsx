import type { Metadata } from 'next';
import Link from 'next/link';
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
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-xl shrink-0">
          <div className="max-w-7xl mx-auto px-6 lg:px-16 h-16 flex items-center justify-between w-full">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-white font-display font-extrabold text-lg">P</span>
              </div>
              <Link href="/" className="font-display font-bold text-xl tracking-tight text-white hover:text-primary transition-colors">
                Presentation<span className="text-primary font-extrabold">AI</span>
              </Link>
            </div>

            <nav className="flex gap-1 sm:gap-6 items-center">
              <Link href="/" className="px-3 py-1.5 rounded-lg text-sm font-medium text-on-surface-variant hover:text-primary hover:bg-white/5 transition-colors">
                Home
              </Link>
              <Link href="/generator" className="px-3 py-1.5 rounded-lg text-sm font-medium text-on-surface-variant hover:text-primary hover:bg-white/5 transition-colors">
                Generator
              </Link>
              <Link href="/history" className="px-3 py-1.5 rounded-lg text-sm font-medium text-on-surface-variant hover:text-primary hover:bg-white/5 transition-colors">
                History
              </Link>
              <Link href="/settings" className="px-3 py-1.5 rounded-lg text-sm font-medium text-on-surface-variant hover:text-primary hover:bg-white/5 transition-colors">
                Settings
              </Link>
            </nav>
            
            <div className="flex items-center gap-4">
              <Link href="/generator" className="hidden sm:inline-flex bg-primary hover:bg-primary/95 text-white font-medium text-xs px-4 py-2 rounded-lg transition-colors shadow-lg shadow-primary/20 hover:shadow-primary/30">
                Create New
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-grow flex flex-col max-w-7xl w-full mx-auto px-6 lg:px-16 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-white/5 py-10 bg-surface-container-lowest">
          <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-on-surface-variant">
            <div className="font-display font-bold text-sm text-primary">PresentationAI</div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <Link href="/settings" className="hover:text-primary transition-colors">Settings</Link>
            </div>
            <div>
              &copy; {new Date().getFullYear()} PresentationAI. All rights reserved.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
