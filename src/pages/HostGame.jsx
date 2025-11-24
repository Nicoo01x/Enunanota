import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import MusicController from '../components/MusicController';
import {
  listenToGame,
  listenToPlayers,
  listenToBuzzes,
  startRound,
  endRound,
  nextRound,
  endGame,
  resolveBuzzCorrect,
  resolveBuzzIncorrect,
} from '../firebase/gameService';

/**
 * Host Game Panel (/host/:gameId)
 * Main control panel for the host with round controls, players, and buzzes
 */
const HostGame = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();

  const [game, setGame] = useState(null);
  const [players, setPlayers] = useState([]);
  const [buzzes, setBuzzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copyMessage, setCopyMessage] = useState('');

  // Listen to game updates
  useEffect(() => {
    if (!gameId) return;

    const unsubscribeGame = listenToGame(gameId, (gameData) => {
      if (!gameData) {
        setError('Esta partida no existe o ha sido eliminada.');
        setLoading(false);
        return;
      }

      setGame(gameData);
      setLoading(false);

      // If game ended, show message
      if (gameData.estado === 'finalizada') {
        // Could show a modal or redirect
      }
    });

    const unsubscribePlayers = listenToPlayers(gameId, (playersData) => {
      setPlayers(playersData);
    });

    return () => {
      unsubscribeGame();
      unsubscribePlayers();
    };
  }, [gameId]);

  // Listen to buzzes for current round
  useEffect(() => {
    if (!gameId || !game) return;

    const unsubscribe = listenToBuzzes(gameId, game.rondaActual, (buzzesData) => {
      setBuzzes(buzzesData);
    });

    return () => unsubscribe();
  }, [gameId, game?.rondaActual]);

  const handleCopyLink = () => {
    const joinUrl = `${window.location.origin}${window.location.pathname}#/join?codigo=${game.codigo}`;
    navigator.clipboard.writeText(joinUrl);
    setCopyMessage('Enlace copiado');
    setTimeout(() => setCopyMessage(''), 3000);
  };

  const handleStartRound = async () => {
    try {
      await startRound(gameId);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEndRound = async () => {
    try {
      await endRound(gameId);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleNextRound = async () => {
    try {
      await nextRound(gameId);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEndGame = async () => {
    if (!confirm('¿Estás seguro de que quieres terminar la partida?')) return;

    try {
      await endGame(gameId);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCorrectAnswer = async (buzz) => {
    try {
      await resolveBuzzCorrect(gameId, buzz.id, buzz.playerId);
      // Terminar la ronda automáticamente después de una respuesta correcta
      await endRound(gameId);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleIncorrectAnswer = async (buzz) => {
    try {
      await resolveBuzzIncorrect(gameId, buzz.id, buzz.playerId);
    } catch (err) {
      setError(err.message);
    }
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
            <Button onClick={() => navigate('/')}>Volver al inicio</Button>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const roundStateText = {
    esperando: 'Esperando',
    en_curso: 'En curso',
    finalizada: 'Finalizada',
  };

  // Find the most recent buzz to highlight
  const mostRecentBuzzPlayerId = buzzes.length > 0 ? buzzes[buzzes.length - 1].playerId : null;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header with game code and controls */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                En una nota
              </h1>
              <p className="text-sm text-slate-400 mb-3">Modo Anfitrión</p>
              <div className="p-4 bg-cyan-500/10 border-2 border-cyan-500/50 rounded-lg inline-block">
                <p className="text-3xl md:text-4xl font-bold text-cyan-400">
                  {game?.codigo}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="ghost"
                onClick={handleCopyLink}
                className="border-2 border-cyan-500/50 hover:border-cyan-500 hover:bg-cyan-500/10"
              >
                {copyMessage || 'Copiar Código'}
              </Button>
              <Button
                variant="danger"
                onClick={handleEndGame}
                className="bg-red-500 hover:bg-red-600"
              >
                Terminar
              </Button>
            </div>
          </div>
        </Card>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {/* Two column layout */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left column - Round control */}
          <div className="space-y-6">
            <Card title="Control de ronda">
              <div className="space-y-4">
                <div>
                  <p className="text-lg">
                    <span className="text-slate-400">Ronda actual:</span>{' '}
                    <span className="font-bold text-indigo-400">{game?.rondaActual}</span>
                  </p>
                  <p className="text-lg">
                    <span className="text-slate-400">Estado de la ronda:</span>{' '}
                    <span className="font-bold text-pink-400">
                      {roundStateText[game?.estadoRonda]}
                    </span>
                  </p>
                </div>

                <div className="p-3 bg-slate-700/50 rounded-lg">
                  <p className="text-sm text-slate-300">
                    Reproduce la música desde tu dispositivo (Spotify, YouTube, etc.)
                    y usa estos controles para manejar la ronda.
                  </p>
                </div>

                <div className="space-y-2">
                  <Button
                    variant="primary"
                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold"
                    disabled={game?.estadoRonda !== 'esperando'}
                    onClick={handleStartRound}
                  >
                    Iniciar Ronda
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
                    disabled={game?.estadoRonda !== 'en_curso'}
                    onClick={handleEndRound}
                  >
                    Finalizar Ronda
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full border-2 border-amber-500/50 hover:border-amber-500 hover:bg-amber-500/10 text-amber-400"
                    disabled={game?.estadoRonda !== 'finalizada'}
                    onClick={handleNextRound}
                  >
                    Siguiente Ronda
                  </Button>
                </div>
              </div>
            </Card>

            {/* Music Controller */}
            <MusicController />

            {/* Buzz queue */}
            <Card title="Pulsaciones de esta ronda">
              {buzzes.length === 0 ? (
                <p className="text-slate-400 text-center py-8">
                  No hay pulsaciones aún
                </p>
              ) : (
                <div className="space-y-3">
                  {buzzes.map((buzz, index) => (
                    <div
                      key={buzz.id}
                      className="p-4 bg-slate-700 rounded-lg space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-50">
                            #{index + 1} - {buzz.nombreJugador}
                          </p>
                          <p className="text-xs text-slate-400">
                            {buzz.timestamp?.toDate?.().toLocaleTimeString() || 'Ahora'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleCorrectAnswer(buzz)}
                        >
                          Respuesta correcta (+1)
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleIncorrectAnswer(buzz)}
                        >
                          Respuesta incorrecta (-1 y bloquear)
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Right column - Players table */}
          <div>
            <Card title="Jugadores y puntajes">
              {players.length === 0 ? (
                <p className="text-slate-400 text-center py-8">
                  Esperando jugadores...
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-2 px-2 text-slate-400 font-semibold">
                          Jugador
                        </th>
                        <th className="text-center py-2 px-2 text-slate-400 font-semibold">
                          Puntaje
                        </th>
                        <th className="text-left py-2 px-2 text-slate-400 font-semibold">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {players.map((player) => {
                        const isLastBuzz = player.uid === mostRecentBuzzPlayerId;
                        return (
                          <tr
                            key={player.id}
                            className={`border-b border-slate-700/50 ${
                              isLastBuzz ? 'bg-pink-500/10 border-pink-500' : ''
                            }`}
                          >
                            <td className="py-3 px-2 text-slate-50 font-medium">
                              {player.nombre}
                              {isLastBuzz && (
                                <span className="ml-2 text-xs text-pink-400">
                                  (Última pulsación)
                                </span>
                              )}
                            </td>
                            <td className="text-center py-3 px-2 text-2xl font-bold text-indigo-400">
                              {player.puntaje}
                            </td>
                            <td className="py-3 px-2">
                              {player.bloqueadoEstaRonda ? (
                                <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded">
                                  Bloqueado esta ronda
                                </span>
                              ) : (
                                <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
                                  Activo esta ronda
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default HostGame;
