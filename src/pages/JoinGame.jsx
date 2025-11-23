import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { findGameByCode, joinGame } from '../firebase/gameService';
import { getCurrentUserId } from '../firebase/auth';

/**
 * Join Game page (/join)
 * Form to join an existing game with a code
 */
const JoinGame = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [gameCode, setGameCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Pre-fill game code from URL params if present
  useEffect(() => {
    const codeParam = searchParams.get('codigo');
    if (codeParam) {
      setGameCode(codeParam.toUpperCase());
    }
  }, [searchParams]);

  const handleJoinGame = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors = {};
    if (!gameCode.trim()) {
      newErrors.gameCode = 'Por favor ingresa el código de la partida.';
    }
    if (!playerName.trim()) {
      newErrors.playerName = 'Por favor ingresa tu nombre.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('No se pudo obtener tu identificación. Recarga la página.');
      }

      // Find game by code
      const result = await findGameByCode(gameCode.trim());
      if (!result) {
        setErrors({
          gameCode: 'No se encontró una partida activa con este código.',
        });
        setLoading(false);
        return;
      }

      const { gameId } = result;

      // Join the game
      const playerDocId = await joinGame(gameId, userId, playerName.trim());

      // Store player info in localStorage for reference
      localStorage.setItem('playerName', playerName.trim());
      localStorage.setItem('currentGameId', gameId);

      // Navigate to player game view
      navigate(`/player/${gameId}`);
    } catch (err) {
      console.error('Error joining game:', err);
      setErrors({
        general: err.message || 'Error al unirse a la partida. Intenta nuevamente.',
      });
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-center min-h-[70vh]">
        <Card className="max-w-md w-full">
          <h1 className="text-3xl font-bold text-slate-50 mb-6">
            Unirse a una partida
          </h1>

          <form onSubmit={handleJoinGame} className="space-y-6">
            <Input
              label="Código de partida"
              placeholder="Ejemplo: ABCD12"
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value.toUpperCase())}
              error={errors.gameCode}
              maxLength={6}
            />

            <Input
              label="Tu nombre"
              placeholder="Ingresa tu nombre"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              error={errors.playerName}
            />

            {errors.general && (
              <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg">
                <p className="text-sm text-red-500">{errors.general}</p>
              </div>
            )}

            <Button
              type="submit"
              variant="secondary"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Uniéndose...' : 'Unirse'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-sm text-slate-400 text-center">
              El anfitrión debe darte el código de la partida para que puedas unirte
            </p>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default JoinGame;
