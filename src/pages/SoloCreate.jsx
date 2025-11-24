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
        <Card className="max-w-md w-full">
          <h1 className="text-3xl font-bold text-slate-50 mb-2">
            Crear partida sin anfitrión
          </h1>
          <p className="text-slate-400 mb-6">
            En este modo, todos los jugadores compiten al mismo tiempo. El sistema evalúa automáticamente las respuestas.
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
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              disabled={loading}
            >
              {loading ? 'Creando partida...' : 'Crear partida'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">¿Cómo funciona?</h3>
            <ul className="text-xs text-slate-400 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-pink-400">•</span>
                <span>El primero en presionar el botón tiene prioridad para responder</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-400">•</span>
                <span>Todos pueden enviar sus respuestas en 20 segundos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-400">•</span>
                <span>El sistema evalúa automáticamente las respuestas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-400">•</span>
                <span>Si nadie sabe la canción, pueden votarla para saltearla</span>
              </li>
            </ul>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default SoloCreate;
