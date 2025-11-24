import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { createSoloGame } from '../firebase/gameService';
import { getCurrentUserId } from '../firebase/auth';

/**
 * Solo Create page (/solo/create)
 * Form to create a new solo mode game (no host)
 */
const SoloCreate = () => {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateGame = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('No se pudo obtener tu identificación. Recarga la página.');
      }

      const { gameId, codigo } = await createSoloGame(
        userId,
        playerName || 'Jugador'
      );

      // Navigate to solo game panel
      navigate(`/solo/${gameId}`);
    } catch (err) {
      console.error('Error creating solo game:', err);
      setError(err.message || 'Error al crear la partida. Intenta nuevamente.');
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-center min-h-[70vh]">
        <Card className="max-w-md w-full bg-slate-800/50 backdrop-blur-sm border border-slate-700">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 text-center">
            Crear Partida
          </h1>
          <p className="text-slate-400 text-center mb-8">
            Modo sin Anfitrión - Evaluación Automática
          </p>

          <form onSubmit={handleCreateGame} className="space-y-6">
            <Input
              label="Tu nombre"
              placeholder="Ingresa tu nombre"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              required
            />

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              variant="secondary"
              size="lg"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:scale-105 transition-all"
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Partida'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-700">
            <h3 className="text-sm text-white font-semibold text-center mb-4">¿Cómo funciona?</h3>
            <ul className="text-sm text-slate-400 space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 text-lg">•</span>
                <span>El primero en presionar tiene prioridad</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 text-lg">•</span>
                <span>Todos pueden responder en 20 segundos</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 text-lg">•</span>
                <span>Evaluación automática de respuestas</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 text-lg">•</span>
                <span>Voten para saltear si nadie sabe</span>
              </li>
            </ul>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default SoloCreate;
