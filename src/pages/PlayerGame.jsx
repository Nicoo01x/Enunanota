import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import {
  listenToGame,
  listenToPlayer,
  listenToPlayers,
  addBuzz,
} from '../firebase/gameService';
import { getCurrentUserId } from '../firebase/auth';

/**
 * Player Game View (/player/:gameId)
 * Main interface for players with the buzz button
 */
const PlayerGame = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();

  const [game, setGame] = useState(null);
  const [player, setPlayer] = useState(null);
  const [allPlayers, setAllPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasBuzzed, setHasBuzzed] = useState(false);
  const [feedback, setFeedback] = useState('');

  const userId = getCurrentUserId();

  // Listen to game updates
  useEffect(() => {
    if (!gameId || !userId) return;

    const unsubscribeGame = listenToGame(gameId, (gameData) => {
      if (!gameData) {
        setError('Esta partida no existe o ha sido eliminada.');
        setLoading(false);
        return;
      }

      setGame(gameData);
      setLoading(false);

      if (gameData.estado === 'finalizada') {
        setFeedback('La partida ha terminado.');
      }
    });

    const unsubscribePlayer = listenToPlayer(gameId, userId, (playerData) => {
      if (!playerData) {
        // Player not found - they haven't joined yet
        setError('No estás registrado en esta partida.');
        setLoading(false);
        return;
      }

      setPlayer(playerData);
      setLoading(false);
    });

    const unsubscribePlayers = listenToPlayers(gameId, (playersData) => {
      setAllPlayers(playersData);
    });

    return () => {
      unsubscribeGame();
      unsubscribePlayer();
      unsubscribePlayers();
    };
  }, [gameId, userId]);

  // Reset hasBuzzed when round changes
  useEffect(() => {
    if (game?.estadoRonda === 'esperando') {
      setHasBuzzed(false);
      setFeedback('');
    }
  }, [game?.estadoRonda, game?.rondaActual]);

  // Track score changes for feedback
  useEffect(() => {
    if (!player) return;

    const prevScore = parseInt(localStorage.getItem('prevScore') || '0');
    if (player.puntaje > prevScore) {
      setFeedback('¡Respuesta correcta! Ganaste 1 punto.');
      setTimeout(() => setFeedback(''), 5000);
    } else if (player.puntaje < prevScore) {
      setFeedback('Respuesta incorrecta. Perdiste 1 punto y quedas bloqueado hasta la próxima ronda.');
      setTimeout(() => setFeedback(''), 5000);
    }

    localStorage.setItem('prevScore', player.puntaje.toString());
  }, [player?.puntaje]);

  const handleBuzz = async () => {
    if (!game || !player) return;

    try {
      setHasBuzzed(true);
      await addBuzz(gameId, userId, player.nombre, game.rondaActual);
      setFeedback('Has pulsado. Espera a que el anfitrión decida.');
    } catch (err) {
      console.error('Error adding buzz:', err);
      setError(err.message);
      setHasBuzzed(false);
    }
  };

  const canBuzz =
    game?.estado === 'activa' &&
    game?.estadoRonda === 'en_curso' &&
    !player?.bloqueadoEstaRonda &&
    !hasBuzzed;

  const getButtonHelperText = () => {
    if (game?.estado === 'finalizada') {
      return 'La partida ha terminado.';
    }
    if (game?.estadoRonda === 'esperando') {
      return 'Espera a que el anfitrión inicie la ronda.';
    }
    if (game?.estadoRonda === 'finalizada') {
      return 'La ronda ya terminó.';
    }
    if (player?.bloqueadoEstaRonda) {
      return 'No puedes participar en esta ronda.';
    }
    if (hasBuzzed) {
      return 'Espera a que el anfitrión decida.';
    }
    return '';
  };

  const getRoundStatusText = () => {
    if (!game) return '';

    switch (game.estadoRonda) {
      case 'esperando':
        return 'Esperando a que el anfitrión inicie la ronda…';
      case 'en_curso':
        return '¡Ronda en curso! Escucha la canción y presiona el botón si la conoces.';
      case 'finalizada':
        return 'La ronda ha finalizado. Espera a la siguiente.';
      default:
        return '';
    }
  };

  const getPlayerStateText = () => {
    if (!player) return '';

    if (player.bloqueadoEstaRonda) {
      return 'Estás bloqueado en esta ronda por una respuesta incorrecta.';
    }
    return 'Estás activo en esta ronda.';
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[70vh]">
          <p className="text-xl text-slate-400">Cargando partida...</p>
        </div>
      </AppLayout>
    );
  }

  if (error && !game) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[70vh]">
          <Card className="max-w-md text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => navigate('/')}>Volver al inicio</Button>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (game?.estado === 'finalizada') {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[70vh]">
          <Card className="max-w-md text-center">
            <h2 className="text-2xl font-bold mb-4">La partida ha terminado</h2>
            <p className="text-slate-300 mb-6">
              Tu puntaje final: <span className="text-3xl font-bold text-indigo-400">{player?.puntaje || 0}</span>
            </p>
            <Button onClick={() => navigate('/')}>Volver al inicio</Button>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header with player info */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
          <div className="text-center space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              En una nota
            </h1>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                <span className="text-sm text-slate-400">Jugador: </span>
                <span className="font-semibold text-cyan-400">{player?.nombre}</span>
              </div>
              <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <span className="text-sm text-slate-400">Puntos: </span>
                <span className="text-2xl font-bold text-emerald-400">{player?.puntaje || 0}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Status area */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Ronda:</span>
              <span className="font-bold text-cyan-400 text-3xl">{game?.rondaActual}</span>
            </div>

            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
              <p className="text-slate-200">{getRoundStatusText()}</p>
            </div>

            <div className={`p-4 rounded-lg border ${
              player?.bloqueadoEstaRonda
                ? 'bg-red-500/10 border-red-500/30'
                : 'bg-emerald-500/10 border-emerald-500/30'
            }`}>
              <p
                className={`font-semibold ${
                  player?.bloqueadoEstaRonda ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                {getPlayerStateText()}
              </p>
            </div>
          </div>
        </Card>

        {/* Main buzz button */}
        <div className="py-8">
          <Button
            variant={canBuzz ? 'secondary' : 'ghost'}
            size="lg"
            className={`w-full py-10 text-2xl md:text-3xl font-bold transition-all duration-300 ${
              canBuzz
                ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 shadow-2xl shadow-cyan-500/50 hover:scale-105 text-white'
                : 'bg-slate-800/50 border-2 border-slate-700'
            }`}
            disabled={!canBuzz}
            onClick={handleBuzz}
          >
            {canBuzz ? '🎵 ¡Yo la sé!' : '¡Yo la sé!'}
          </Button>

          {getButtonHelperText() && (
            <p className="text-center text-sm text-slate-400 mt-3">
              {getButtonHelperText()}
            </p>
          )}
        </div>

        {/* Feedback messages */}
        {feedback && (
          <div
            className={`p-4 rounded-lg text-center font-semibold ${
              feedback.includes('correcta')
                ? 'bg-green-500/20 text-green-400 border border-green-500'
                : feedback.includes('incorrecta')
                ? 'bg-red-500/20 text-red-400 border border-red-500'
                : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500'
            }`}
          >
            {feedback}
          </div>
        )}

        {/* Mini scoreboard */}
        <Card title="🏆 Marcador" className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
          {allPlayers.length === 0 ? (
            <p className="text-slate-400 text-center py-4">
              No hay jugadores aún
            </p>
          ) : (
            <div className="space-y-2">
              {allPlayers
                .sort((a, b) => b.puntaje - a.puntaje)
                .map((p, index) => (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                      p.uid === userId
                        ? 'bg-cyan-500/10 border-2 border-cyan-500/50 shadow-lg'
                        : 'bg-slate-700/30 border border-slate-600/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-xl font-bold ${
                        index === 0 ? 'text-amber-400' :
                        index === 1 ? 'text-slate-300' :
                        index === 2 ? 'text-orange-400' :
                        'text-slate-400'
                      }`}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </span>
                      <span className="font-semibold text-white">
                        {p.nombre}
                        {p.uid === userId && (
                          <span className="text-xs text-cyan-400 ml-2">(Tú)</span>
                        )}
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-emerald-400">
                      {p.puntaje}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
};

export default PlayerGame;
