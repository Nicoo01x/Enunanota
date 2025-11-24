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
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-cyan-900/10 via-slate-900 to-emerald-900/10" />

      {/* Subtle pattern overlay */}
      <div className="fixed inset-0 -z-10" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.05) 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }} />

      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="max-w-5xl w-full space-y-12 text-center">
          {/* Title with modern design */}
          <div className="space-y-8">
            <div className="relative inline-block">
              <h1 className="text-6xl md:text-8xl font-black text-white typing-animation tracking-tight">
                En una nota
              </h1>
              <div className="absolute -bottom-3 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400 rounded-full" />
            </div>

            {/* Creator info with fade-in */}
            <div className={`flex flex-col items-center space-y-4 transition-opacity duration-1000 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
              <img
                src="https://github.com/Nicoo01x.png"
                alt="Nicolas Cabanillas"
                className="w-20 h-20 rounded-full border-3 border-cyan-400/50 shadow-xl hover:scale-105 transition-transform duration-300"
              />
              <p className="text-sm md:text-base text-slate-400">
                Creado por <span className="text-cyan-400 font-semibold">Nicolas Cabanillas</span>
              </p>
            </div>

            <p className={`text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto transition-opacity duration-1000 delay-300 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
              Adivina canciones con tus amigos en tiempo real
            </p>
          </div>

          {/* Action cards with modern design */}
          <div className={`grid md:grid-cols-3 gap-6 transition-opacity duration-1000 delay-500 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
            {/* Create game with host */}
            <Card className="group hover:scale-105 transition-all duration-300 cursor-pointer bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/20">
              <div className="space-y-5 py-6">
                <div className="text-5xl">🎵</div>
                <h2 className="text-2xl font-bold text-white">
                  Con Anfitrión
                </h2>
                <p className="text-slate-400 text-sm min-h-[48px]">
                  El anfitrión controla las rondas y evalúa respuestas
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full mt-4 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold shadow-lg shadow-cyan-500/25"
                  onClick={() => navigate('/host')}
                >
                  Crear Partida
                </Button>
              </div>
            </Card>

            {/* Solo mode - new option */}
            <Card className="group hover:scale-105 transition-all duration-300 cursor-pointer bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/20 relative overflow-hidden">
              <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs px-3 py-1 rounded-full font-bold">
                NUEVO
              </div>
              <div className="space-y-5 py-6">
                <div className="text-5xl">⚡</div>
                <h2 className="text-2xl font-bold text-white">
                  Sin Anfitrión
                </h2>
                <p className="text-slate-400 text-sm min-h-[48px]">
                  Todos juegan simultáneamente con evaluación automática
                </p>
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/25"
                  onClick={() => navigate('/solo/create')}
                >
                  Jugar Ahora
                </Button>
              </div>
            </Card>

            {/* Join game */}
            <Card className="group hover:scale-105 transition-all duration-300 cursor-pointer bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/20">
              <div className="space-y-5 py-6">
                <div className="text-5xl">🎯</div>
                <h2 className="text-2xl font-bold text-white">
                  Unirse
                </h2>
                <p className="text-slate-400 text-sm min-h-[48px]">
                  Únete a una partida existente con un código
                </p>
                <Button
                  variant="ghost"
                  size="lg"
                  className="w-full mt-4 bg-transparent border-2 border-amber-500 text-amber-400 hover:bg-amber-500 hover:text-white font-semibold transition-all"
                  onClick={() => navigate('/join')}
                >
                  Ingresar Código
                </Button>
              </div>
            </Card>
          </div>

          {/* Features list */}
          <div className={`grid md:grid-cols-3 gap-6 transition-opacity duration-1000 delay-700 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex items-center justify-center gap-3 text-slate-300 bg-slate-800/30 px-4 py-3 rounded-lg border border-slate-700/50">
              <span className="text-2xl">✨</span>
              <span className="font-medium">Multiplataforma</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-slate-300 bg-slate-800/30 px-4 py-3 rounded-lg border border-slate-700/50">
              <span className="text-2xl">⚡</span>
              <span className="font-medium">Tiempo Real</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-slate-300 bg-slate-800/30 px-4 py-3 rounded-lg border border-slate-700/50">
              <span className="text-2xl">🎮</span>
              <span className="font-medium">Fácil de Usar</span>
            </div>
          </div>

          {/* Footer info */}
          <p className={`text-slate-400 max-w-2xl mx-auto transition-opacity duration-1000 delay-1000 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
            Funciona en cualquier dispositivo. Conecta con tus amigos y pon a prueba tus conocimientos musicales.
          </p>
        </div>
      </div>
    </AppLayout>
  );
};

export default Landing;
