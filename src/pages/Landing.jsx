import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import Button from '../components/Button';
import Card from '../components/Card';

/**
 * Landing page (/)
 * Entry point with options to create or join a game
 */
const Landing = () => {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Mostrar contenido después de la animación de typing (3 segundos)
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AppLayout showHeader={false}>
      {/* Animated gradient background overlay */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-indigo-900/20 via-slate-900 to-pink-900/20 animate-gradient" />

      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="max-w-4xl w-full space-y-8 text-center">
          {/* Title with typing animation and glow */}
          <div className="space-y-6">
            <div className="relative">
              <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 typing-animation animate-pulse-glow">
                En una nota
              </h1>
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-3xl -z-10" />
            </div>

            {/* Creator info with fade-in and float */}
            <div className={`flex flex-col items-center space-y-3 transition-opacity duration-1000 ${showContent ? 'opacity-100 animate-float' : 'opacity-0'}`}>
              <img
                src="https://github.com/Nicoo01x.png"
                alt="Nicolas Cabanillas"
                className="w-24 h-24 rounded-full border-4 border-indigo-500 shadow-2xl shadow-indigo-500/50 hover:scale-110 transition-transform duration-300"
              />
              <p className="text-base md:text-lg text-slate-300">
                Creador: <span className="text-indigo-400 font-bold">Nicolas Cabanillas</span>
              </p>
            </div>

            <p className={`text-lg md:text-2xl text-slate-200 max-w-2xl mx-auto transition-opacity duration-1000 delay-300 font-medium ${showContent ? 'opacity-100' : 'opacity-0'}`}>
              Juego para adivinar canciones. Elige tu modo de juego y diviértete con tus amigos.
            </p>
          </div>

          {/* Action cards with fade-in and hover effects */}
          <div className={`grid md:grid-cols-3 gap-6 mt-12 transition-opacity duration-1000 delay-500 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
            {/* Create game with host */}
            <Card className="hover:shadow-2xl hover:shadow-indigo-500/30 hover:scale-105 hover:-translate-y-2 transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-indigo-500/50 bg-gradient-to-br from-slate-800 to-slate-900">
              <div className="space-y-4 py-6">
                <div className="text-6xl animate-float">🎵</div>
                <h2 className="text-2xl font-bold text-slate-50">
                  Con Anfitrión
                </h2>
                <p className="text-slate-400 text-sm min-h-[40px]">
                  El anfitrión controla las rondas y decide las respuestas correctas
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full mt-4 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50"
                  onClick={() => navigate('/host')}
                >
                  Crear partida
                </Button>
              </div>
            </Card>

            {/* Solo mode - new option */}
            <Card className="hover:shadow-2xl hover:shadow-pink-500/30 hover:scale-105 hover:-translate-y-2 transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-pink-500/50 bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden">
              <div className="absolute top-2 right-2 bg-pink-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                NUEVO
              </div>
              <div className="space-y-4 py-6">
                <div className="text-6xl animate-float" style={{ animationDelay: '0.5s' }}>🎮</div>
                <h2 className="text-2xl font-bold text-slate-50">
                  Sin Anfitrión
                </h2>
                <p className="text-slate-400 text-sm min-h-[40px]">
                  Todos juegan al mismo tiempo. Sistema automático de evaluación
                </p>
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full mt-4 shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                  onClick={() => navigate('/solo/create')}
                >
                  Jugar sin anfitrión
                </Button>
              </div>
            </Card>

            {/* Join game */}
            <Card className="hover:shadow-2xl hover:shadow-purple-500/30 hover:scale-105 hover:-translate-y-2 transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-purple-500/50 bg-gradient-to-br from-slate-800 to-slate-900">
              <div className="space-y-4 py-6">
                <div className="text-6xl animate-float" style={{ animationDelay: '1s' }}>🎯</div>
                <h2 className="text-2xl font-bold text-slate-50">
                  Unirse a Partida
                </h2>
                <p className="text-slate-400 text-sm min-h-[40px]">
                  Únete con un código a una partida existente
                </p>
                <Button
                  variant="ghost"
                  size="lg"
                  className="w-full mt-4 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 border-2 border-purple-500/50 hover:border-purple-500"
                  onClick={() => navigate('/join')}
                >
                  Unirse
                </Button>
              </div>
            </Card>
          </div>

          {/* Features list */}
          <div className={`mt-12 grid md:grid-cols-3 gap-4 text-sm transition-opacity duration-1000 delay-700 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex items-center justify-center gap-2 text-slate-300">
              <span className="text-xl">✨</span>
              <span>Multiplataforma</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-slate-300">
              <span className="text-xl">⚡</span>
              <span>Tiempo real</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-slate-300">
              <span className="text-xl">🎨</span>
              <span>Diseño moderno</span>
            </div>
          </div>

          {/* Footer info */}
          <p className={`text-sm text-slate-400 mt-8 transition-opacity duration-1000 delay-1000 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
            Funciona en cualquier dispositivo. Conecta con tus amigos y pon a prueba tus conocimientos musicales.
          </p>
        </div>
      </div>
    </AppLayout>
  );
};

export default Landing;
