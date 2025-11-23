import React from 'react';
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

  return (
    <AppLayout showHeader={false}>
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="max-w-2xl w-full space-y-8 text-center">
          {/* Title and subtitle */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-indigo-400">
              En una nota
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-xl mx-auto">
              Juego para adivinar canciones. Una persona es el anfitrión y los demás juegan desde sus dispositivos.
            </p>
          </div>

          {/* Action cards */}
          <div className="grid md:grid-cols-2 gap-6 mt-12">
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
