import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { signInAnonymous } from './firebase/auth';

// Pages
import Landing from './pages/Landing';
import HostCreate from './pages/HostCreate';
import HostGame from './pages/HostGame';
import JoinGame from './pages/JoinGame';
import PlayerGame from './pages/PlayerGame';
import SoloCreate from './pages/SoloCreate';
import SoloGame from './pages/SoloGame';

/**
 * Main App component with routing
 * Uses HashRouter for GitHub Pages compatibility
 */
function App() {
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Sign in anonymously on app load
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymous();
        setAuthReady(true);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setAuthError('Error al conectar. Por favor recarga la página.');
      }
    };

    initAuth();
  }, []);

  if (authError) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 rounded-xl shadow-lg p-6 text-center">
          <p className="text-red-500 mb-4">{authError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg"
          >
            Recargar página
          </button>
        </div>
      </div>
    );
  }

  if (!authReady) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/host" element={<HostCreate />} />
        <Route path="/host/:gameId" element={<HostGame />} />
        <Route path="/join" element={<JoinGame />} />
        <Route path="/player/:gameId" element={<PlayerGame />} />
        <Route path="/solo/create" element={<SoloCreate />} />
        <Route path="/solo/:gameId" element={<SoloGame />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
