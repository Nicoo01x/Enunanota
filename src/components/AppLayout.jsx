import React from 'react';
import Header from './Header';

/**
 * Main layout wrapper for all pages
 * Provides consistent background, spacing, and structure
 * @param {Object} props
 * @param {boolean} props.showHeader - Whether to show the header
 * @param {React.ReactNode} props.children - Page content
 */
const AppLayout = ({ showHeader = true, children }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      {showHeader && <Header />}
      <main className="container mx-auto px-4 py-6 md:px-8 max-w-6xl">
        {children}
      </main>
      <footer className="text-center py-6 text-sm text-slate-400">
        Proyecto En una nota · Hosteado en GitHub Pages
      </footer>
    </div>
  );
};

export default AppLayout;
