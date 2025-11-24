import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import {
  listenToSoloGame,
  listenToSoloPlayer,
  listenToSoloPlayers,
  submitFirstBuzz,
  submitAnswer,
  listenToRoundAnswers,
  voteSkipSong,
  listenToSkipVotes,
  startSoloRound,
  nextSoloRound,
  endSoloGame,
} from '../firebase/gameService';
import { getCurrentUserId } from '../firebase/auth';

/**
 * Solo Game View (/solo/:gameId)
 * Main interface for solo mode games (no host)
 */
const SoloGame = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();

  const [game, setGame] = useState(null);
  const [player, setPlayer] = useState(null);
  const [allPlayers, setAllPlayers] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [skipVotes, setSkipVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasBuzzed, setHasBuzzed] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [hasVotedSkip, setHasVotedSkip] = useState(false);
  const [answer, setAnswer] = useState('');
  const [countdown, setCountdown] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [copyMessage, setCopyMessage] = useState('');

  const userId = getCurrentUserId();

  // Listen to game updates
  useEffect(() => {
    if (!gameId || !userId) return;

    const unsubscribeGame = listenToSoloGame(gameId, (gameData) => {
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

    const unsubscribePlayer = listenToSoloPlayer(gameId, userId, (playerData) => {
      if (!playerData) {
        setError('No estás registrado en esta partida.');
        setLoading(false);
        return;
      }

      setPlayer(playerData);
      setLoading(false);
    });

    const unsubscribePlayers = listenToSoloPlayers(gameId, (playersData) => {
      setAllPlayers(playersData);
    });

    return () => {
      unsubscribeGame();
      unsubscribePlayer();
      unsubscribePlayers();
    };
  }, [gameId, userId]);

  // Listen to answers for current round
  useEffect(() => {
    if (!gameId || !game) return;

    const unsubscribe = listenToRoundAnswers(gameId, game.rondaActual, (answersData) => {
      setAnswers(answersData);
    });

    return () => unsubscribe();
  }, [gameId, game?.rondaActual]);

  // Listen to skip votes
  useEffect(() => {
    if (!gameId || !game) return;

    const unsubscribe = listenToSkipVotes(gameId, game.rondaActual, (votesData) => {
      setSkipVotes(votesData);
    });

    return () => unsubscribe();
  }, [gameId, game?.rondaActual]);

  // Reset states when round changes
  useEffect(() => {
    if (game?.estadoRonda === 'esperando') {
      setHasBuzzed(false);
      setHasAnswered(false);
      setHasVotedSkip(false);
      setAnswer('');
      setFeedback('');
      setCountdown(null);
    }
  }, [game?.estadoRonda, game?.rondaActual]);

  // Countdown timer when someone buzzes
  useEffect(() => {
    if (game?.estadoRonda === 'esperando_respuesta' && game.firstBuzzTimestamp) {
      const startTime = game.firstBuzzTimestamp.toDate?.() || new Date();
      const endTime = new Date(startTime.getTime() + 20000); // 20 seconds

      const interval = setInterval(() => {
        const now = new Date();
        const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
        setCountdown(remaining);

        if (remaining === 0) {
          clearInterval(interval);
          // Auto advance to next round if timer expires
          if (game.estadoRonda === 'esperando_respuesta') {
            handleAutoAdvance();
          }
        }
      }, 100);

      return () => clearInterval(interval);
    } else {
      setCountdown(null);
    }
  }, [game?.estadoRonda, game?.firstBuzzTimestamp]);

  const handleAutoAdvance = async () => {
    if (!game) return;

    try {
      // Evaluate answers if any were submitted
      if (answers.length > 0) {
        // In a real implementation, you'd evaluate based on correct answer
        // For now, we'll just advance to next round
      }

      await nextSoloRound(gameId);
    } catch (err) {
      console.error('Error auto-advancing:', err);
    }
  };

  const handleBuzz = async () => {
    if (!game || !player) return;

    try {
      setHasBuzzed(true);
      await submitFirstBuzz(gameId, userId, player.nombre);
      setFeedback('¡Presionaste primero! Ahora envía tu respuesta.');
    } catch (err) {
      console.error('Error buzzing:', err);
      setError(err.message);
      setHasBuzzed(false);

      // If someone else buzzed first, show message
      if (err.message.includes('ya presionó')) {
        setFeedback('Otro jugador presionó primero. Espera tu turno para responder.');
      }
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!game || !player || !answer.trim()) return;

    try {
      await submitAnswer(gameId, userId, player.nombre, answer, game.rondaActual);
      setHasAnswered(true);
      setFeedback('Respuesta enviada. Espera a que termine el tiempo.');
      setAnswer('');
    } catch (err) {
      console.error('Error submitting answer:', err);
      setError(err.message);
    }
  };

  const handleSkipVote = async () => {
    try {
      await voteSkipSong(gameId, userId);
      setHasVotedSkip(true);
      setFeedback('Votaste para saltear esta canción.');
    } catch (err) {
      console.error('Error voting to skip:', err);
      setError(err.message);
    }
  };

  const handleStartRound = async () => {
    try {
      await startSoloRound(gameId);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleNextRound = async () => {
    try {
      await nextSoloRound(gameId);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEndGame = async () => {
    if (!confirm('¿Estás seguro de que quieres terminar la partida?')) return;

    try {
      await endSoloGame(gameId);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCopyLink = () => {
    const joinUrl = `${window.location.origin}${window.location.pathname}#/join?codigo=${game.codigo}`;
    navigator.clipboard.writeText(joinUrl);
    setCopyMessage('Enlace copiado');
    setTimeout(() => setCopyMessage(''), 3000);
  };

  const canBuzz =
    game?.estado === 'activa' &&
    game?.estadoRonda === 'en_curso' &&
    !game?.firstBuzzPlayerId &&
    !hasBuzzed;

  const canAnswer =
    game?.estadoRonda === 'esperando_respuesta' &&
    !hasAnswered;

  const canSkip =
    (game?.estadoRonda === 'en_curso' || game?.estadoRonda === 'esperando_respuesta') &&
    !hasVotedSkip;

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
              Tu puntaje final: <span className="text-3xl font-bold text-pink-400">{player?.puntaje || 0}</span>
            </p>
            <Button onClick={() => navigate('/')}>Volver al inicio</Button>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const firstBuzzer = game?.firstBuzzPlayerName;
  const isFirstBuzzer = game?.firstBuzzPlayerId === userId;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-50">
                En una nota – Modo Sin Anfitrión
              </h1>
              <p className="text-2xl md:text-3xl font-bold text-pink-400 mt-2">
                Código: {game?.codigo}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyLink}
              >
                {copyMessage || 'Copiar código'}
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleEndGame}
              >
                Terminar partida
              </Button>
            </div>
          </div>
        </Card>

        {/* Player info and round status */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-xl font-bold mb-3">Tu información</h2>
            <div className="space-y-2">
              <p className="text-lg">
                <span className="text-slate-400">Jugador:</span>{' '}
                <span className="font-semibold text-indigo-400">{player?.nombre}</span>
              </p>
              <p className="text-lg">
                <span className="text-slate-400">Puntaje:</span>{' '}
                <span className="text-3xl font-bold text-pink-400">{player?.puntaje || 0}</span>
              </p>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-bold mb-3">Estado de la ronda</h2>
            <div className="space-y-2">
              <p className="text-lg">
                <span className="text-slate-400">Ronda:</span>{' '}
                <span className="font-bold text-indigo-400">{game?.rondaActual}</span>
              </p>
              <p className="text-lg">
                <span className="text-slate-400">Estado:</span>{' '}
                <span className="font-bold text-pink-400">
                  {game?.estadoRonda === 'esperando' && 'Esperando'}
                  {game?.estadoRonda === 'en_curso' && 'En curso'}
                  {game?.estadoRonda === 'esperando_respuesta' && 'Esperando respuestas'}
                  {game?.estadoRonda === 'finalizada' && 'Finalizada'}
                </span>
              </p>
            </div>
          </Card>
        </div>

        {/* First buzzer notification */}
        {firstBuzzer && game?.estadoRonda === 'esperando_respuesta' && (
          <Card className="border-2 border-pink-500 bg-pink-500/10">
            <div className="text-center space-y-3">
              <p className="text-2xl font-bold text-pink-400">
                {isFirstBuzzer ? '¡Presionaste primero!' : `${firstBuzzer} presionó primero`}
              </p>
              {countdown !== null && (
                <div className="text-6xl font-bold text-slate-50 animate-countdown">
                  {countdown}s
                </div>
              )}
              <p className="text-slate-300">
                {isFirstBuzzer
                  ? 'Envía tu respuesta antes de que termine el tiempo'
                  : 'También puedes enviar tu respuesta'}
              </p>
            </div>
          </Card>
        )}

        {/* Main action area */}
        <Card>
          <div className="space-y-4">
            {/* Buzz button */}
            {game?.estadoRonda === 'en_curso' && !firstBuzzer && (
              <div>
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full py-8 text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                  disabled={!canBuzz}
                  onClick={handleBuzz}
                >
                  ¡Yo la sé!
                </Button>
                {!canBuzz && hasBuzzed && (
                  <p className="text-center text-sm text-slate-400 mt-2">
                    Otro jugador presionó primero
                  </p>
                )}
              </div>
            )}

            {/* Answer form */}
            {canAnswer && (
              <form onSubmit={handleSubmitAnswer} className="space-y-3">
                <Input
                  label="Tu respuesta"
                  placeholder="Nombre de la canción o artista"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  autoFocus
                />
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={!answer.trim()}
                >
                  Enviar respuesta
                </Button>
              </form>
            )}

            {/* Skip vote button */}
            {canSkip && (
              <div className="pt-4 border-t border-slate-700">
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={handleSkipVote}
                  disabled={hasVotedSkip}
                >
                  {hasVotedSkip
                    ? `Has votado para saltear (${skipVotes.length}/${allPlayers.length})`
                    : 'No sé esta canción (Votar para saltear)'}
                </Button>
                {skipVotes.length > 0 && (
                  <p className="text-center text-xs text-slate-400 mt-2">
                    {skipVotes.length} de {allPlayers.length} jugadores votaron para saltear
                  </p>
                )}
              </div>
            )}

            {/* Round controls (for game creator) */}
            {game?.creadorId === userId && (
              <div className="pt-4 border-t border-slate-700 space-y-2">
                <p className="text-xs text-slate-400 text-center mb-2">Controles del creador</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={game?.estadoRonda !== 'esperando'}
                    onClick={handleStartRound}
                  >
                    Iniciar ronda
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={game?.estadoRonda === 'esperando'}
                    onClick={handleNextRound}
                  >
                    Siguiente ronda
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Feedback */}
        {feedback && (
          <div className="p-4 rounded-lg text-center font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500">
            {feedback}
          </div>
        )}

        {/* Scoreboard */}
        <Card title="Marcador">
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
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      p.uid === userId
                        ? 'bg-pink-500/20 border border-pink-500'
                        : 'bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-slate-400">
                        #{index + 1}
                      </span>
                      <span className="font-semibold text-slate-50">
                        {p.nombre}
                        {p.uid === userId && (
                          <span className="text-xs text-pink-400 ml-2">(Tú)</span>
                        )}
                        {p.uid === game?.firstBuzzPlayerId && (
                          <span className="text-xs text-indigo-400 ml-2">⚡ Presionó</span>
                        )}
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-pink-400">
                      {p.puntaje}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </Card>

        {/* Answers submitted (for transparency) */}
        {answers.length > 0 && (
          <Card title={`Respuestas enviadas (${answers.length})`}>
            <div className="space-y-2">
              {answers.map((ans, index) => (
                <div
                  key={ans.id}
                  className="p-3 bg-slate-700/50 rounded-lg flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-50">{ans.nombreJugador}</p>
                    <p className="text-sm text-slate-400">{ans.respuesta}</p>
                  </div>
                  {ans.evaluada && (
                    <span className={`text-xs px-2 py-1 rounded ${
                      ans.esCorrecta
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {ans.esCorrecta ? '✓ Correcta' : '✗ Incorrecta'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default SoloGame;
