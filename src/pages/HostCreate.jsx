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
        <Card className="max-w-md w-full">
          <h1 className="text-3xl font-bold text-slate-50 mb-6">
            Crear partida
          </h1>

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
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Creando partida...' : 'Crear partida'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-sm text-slate-400 text-center">
              Se generará un código único que podrás compartir con los jugadores
            </p>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default HostCreate;
