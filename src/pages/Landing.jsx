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
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="max-w-2xl w-full space-y-8 text-center">
          {/* Title with typing animation */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold text-indigo-400 typing-animation">
              En una nota
            </h1>

            {/* Creator info with fade-in */}
            <div className={`flex flex-col items-center space-y-3 transition-opacity duration-1000 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
              <img
                src="https://github.com/Nicoo01x.png"
                alt="Nicolas Cabanillas"
                className="w-20 h-20 rounded-full border-4 border-indigo-500 shadow-lg"
              />
              <p className="text-base md:text-lg text-slate-400">
                Creador: <span className="text-indigo-400 font-semibold">Nicolas Cabanillas</span>
              </p>
            </div>

            <p className={`text-lg md:text-xl text-slate-300 max-w-xl mx-auto transition-opacity duration-1000 delay-300 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
              Juego para adivinar canciones. Una persona es el anfitrión y los demás juegan desde sus dispositivos.
            </p>
          </div>

          {/* Action cards with fade-in */}
          <div className={`grid md:grid-cols-2 gap-6 mt-12 transition-opacity duration-1000 delay-500 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
            {/* Create game */}
            <Card className="hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer">
              <div className="space-y-4 py-4">
                <div className="text-5xl">🎵</div>
                <h2 className="text-2xl font-semibold text-slate-50">
                  Crear partida
                </h2>
                <p className="text-slate-400 text-sm">
                  Crea una nueva partida como anfitrión y controla las rondas
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full mt-4"
                  onClick={() => navigate('/host')}
                >
                  Crear partida (anfitrión)
                </Button>
              </div>
            </Card>

            {/* Join game */}
            <Card className="hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer">
              <div className="space-y-4 py-4">
                <div className="text-5xl">🎮</div>
                <h2 className="text-2xl font-semibold text-slate-50">
                  Unirse a partida
                </h2>
                <p className="text-slate-400 text-sm">
                  Únete a una partida existente como jugador con un código
                </p>
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full mt-4"
                  onClick={() => navigate('/join')}
                >
                  Unirse a una partida (jugador)
                </Button>
              </div>
            </Card>
          </div>

          {/* Footer info */}
          <p className="text-sm text-slate-400 mt-8">
            Funciona en cualquier dispositivo. El anfitrión crea la partida y los demás se unen con un código.
          </p>
        </div>
      </div>
    </AppLayout>
  );
};

export default Landing;
