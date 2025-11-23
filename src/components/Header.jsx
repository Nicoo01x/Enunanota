import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * App header with title and navigation
 */
const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-slate-800 border-b border-slate-700 py-4">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        <h1
          className="text-2xl md:text-3xl font-bold text-indigo-400 cursor-pointer hover:text-indigo-300 transition-colors"
          onClick={() => navigate('/')}
        >
          En una nota
        </h1>
      </div>
    </header>
  );
};

export default Header;
