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
        <Card className="max-w-md w-full bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-indigo-500/30 shadow-2xl shadow-indigo-500/20">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400 mb-2 text-center">
            Crear partida
          </h1>
          <p className="text-slate-400 text-center mb-6">Como anfitrión</p>

          <form onSubmit={handleCreateGame} className="space-y-6">
            <Input
              label="Nombre del anfitrión (opcional)"
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
              className="w-full shadow-lg shadow-indigo-500/50 hover:shadow-indigo-500/70 hover:scale-105 transition-all"
              disabled={loading}
            >
              {loading ? '⏳ Creando partida...' : '🎵 Crear partida'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <div className="space-y-2">
              <p className="text-sm text-slate-300 font-semibold text-center mb-3">¿Cómo funciona?</p>
              <ul className="text-xs text-slate-400 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400">•</span>
                  <span>Se generará un código único para compartir</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400">•</span>
                  <span>Tú controlarás las rondas y evaluarás respuestas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400">•</span>
                  <span>Los jugadores se unirán con el código</span>
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
