import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { createGame } from '../firebase/gameService';
import { getCurrentUserId } from '../firebase/auth';

/**
 * Host Create page (/host)
 * Form to create a new game
 */
const HostCreate = () => {
  const navigate = useNavigate();
  const [hostName, setHostName] = useState('');
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

      const { gameId, codigo } = await createGame(
        userId,
        hostName || 'Anfitrión'
      );

      // Navigate to host game panel
      navigate(`/host/${gameId}`);
    } catch (err) {
      console.error('Error creating game:', err);
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
          <p className="text-slate-400 text-center mb-8">Modo con Anfitrión</p>

          <form onSubmit={handleCreateGame} className="space-y-6">
            <Input
              label="Tu nombre (opcional)"
              placeholder="Ingresa tu nombre"
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
            />

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold shadow-lg shadow-cyan-500/25 hover:scale-105 transition-all"
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Partida'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-700">
            <div className="space-y-3">
              <p className="text-sm text-white font-semibold text-center mb-4">¿Cómo funciona?</p>
              <ul className="text-sm text-slate-400 space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-cyan-400 text-lg">•</span>
                  <span>Se genera un código único para compartir</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cyan-400 text-lg">•</span>
                  <span>Controlas las rondas y evalúas respuestas</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cyan-400 text-lg">•</span>
                  <span>Los jugadores se unen con el código</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default HostCreate;
