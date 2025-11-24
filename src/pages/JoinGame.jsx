import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { findGameByCode, joinGame, findSoloGameByCode, joinSoloGame } from '../firebase/gameService';
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

      // Try to find normal game first
      let result = await findGameByCode(gameCode.trim());
      let isSoloMode = false;

      // If not found, try solo game
      if (!result) {
        result = await findSoloGameByCode(gameCode.trim());
        isSoloMode = true;
      }

      if (!result) {
        setErrors({
          gameCode: 'No se encontró una partida activa con este código.',
        });
        setLoading(false);
        return;
      }

      const { gameId } = result;

      // Join the appropriate game type
      if (isSoloMode) {
        await joinSoloGame(gameId, userId, playerName.trim());
        localStorage.setItem('playerName', playerName.trim());
        localStorage.setItem('currentGameId', gameId);
        navigate(`/solo/${gameId}`);
      } else {
        await joinGame(gameId, userId, playerName.trim());
        localStorage.setItem('playerName', playerName.trim());
        localStorage.setItem('currentGameId', gameId);
        navigate(`/player/${gameId}`);
      }
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
        <Card className="max-w-md w-full bg-slate-800/50 backdrop-blur-sm border border-slate-700">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 text-center">
            Unirse a Partida
          </h1>
          <p className="text-slate-400 text-center mb-8">Ingresa el código que te compartieron</p>

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
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-lg shadow-amber-500/25 hover:scale-105 transition-all"
              disabled={loading}
            >
              {loading ? 'Uniéndose...' : 'Unirse Ahora'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-700">
            <div className="space-y-3">
              <p className="text-sm text-white font-semibold text-center mb-4">Información</p>
              <ul className="text-sm text-slate-400 space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-amber-400 text-lg">•</span>
                  <span>El código tiene 6 caracteres</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-400 text-lg">•</span>
                  <span>Funciona para partidas con y sin anfitrión</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-400 text-lg">•</span>
                  <span>Puedes unirte desde cualquier dispositivo</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default JoinGame;
