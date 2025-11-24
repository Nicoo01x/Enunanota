import { USE_MOCK_SERVICE, db } from './config';
import { mockGameService } from './mockService';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  addDoc,
  serverTimestamp,
  runTransaction,
  writeBatch,
  orderBy,
} from 'firebase/firestore';

/**
 * Game Service wrapper
 * Uses mock service (localStorage) or real Firebase Firestore
 */

// Real Firebase service
const realService = {
  createGame: async (hostId, hostName = 'Anfitrión') => {
    const generateGameCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    const codeExists = async (codigo) => {
      const q = query(collection(db, 'games'), where('codigo', '==', codigo));
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    };

    let codigo = generateGameCode();
    while (await codeExists(codigo)) {
      codigo = generateGameCode();
    }

    const gameData = {
      codigo,
      hostId,
      hostName,
      estado: 'activa',
      rondaActual: 1,
      estadoRonda: 'esperando',
      creadaEn: serverTimestamp(),
    };

    const gameRef = doc(collection(db, 'games'));
    await setDoc(gameRef, gameData);

    return { gameId: gameRef.id, codigo };
  },

  findGameByCode: async (codigo) => {
    const q = query(
      collection(db, 'games'),
      where('codigo', '==', codigo.toUpperCase()),
      where('estado', '==', 'activa')
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    const gameDoc = snapshot.docs[0];
    return { gameId: gameDoc.id, gameData: gameDoc.data() };
  },

  joinGame: async (gameId, playerId, nombre) => {
    const playersRef = collection(db, 'games', gameId, 'players');
    const q = query(playersRef, where('uid', '==', playerId));
    const existingPlayers = await getDocs(q);

    if (!existingPlayers.empty) {
      return existingPlayers.docs[0].id;
    }

    const playerData = {
      uid: playerId,
      nombre,
      puntaje: 0,
      bloqueadoEstaRonda: false,
      creadoEn: serverTimestamp(),
    };

    const playerRef = await addDoc(playersRef, playerData);
    return playerRef.id;
  },

  listenToGame: (gameId, callback) => {
    const gameRef = doc(db, 'games', gameId);
    return onSnapshot(
      gameRef,
      (snapshot) => {
        if (snapshot.exists()) {
          callback({ id: snapshot.id, ...snapshot.data() });
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('Error listening to game:', error);
        callback(null);
      }
    );
  },

  listenToPlayers: (gameId, callback) => {
    const playersRef = collection(db, 'games', gameId, 'players');
    return onSnapshot(
      playersRef,
      (snapshot) => {
        const players = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(players);
      },
      (error) => {
        console.error('Error listening to players:', error);
        callback([]);
      }
    );
  },

  listenToBuzzes: (gameId, roundNumber, callback) => {
    const buzzesRef = collection(db, 'games', gameId, 'buzzes');
    const q = query(
      buzzesRef,
      where('numeroRonda', '==', roundNumber),
      where('resuelta', '==', false),
      orderBy('timestamp', 'asc')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const buzzes = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(buzzes);
      },
      (error) => {
        console.error('Error listening to buzzes:', error);
        callback([]);
      }
    );
  },

  listenToPlayer: (gameId, playerId, callback) => {
    const playersRef = collection(db, 'games', gameId, 'players');
    const q = query(playersRef, where('uid', '==', playerId));

    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const playerDoc = snapshot.docs[0];
          callback({ id: playerDoc.id, ...playerDoc.data() });
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('Error listening to player:', error);
        callback(null);
      }
    );
  },

  startRound: async (gameId) => {
    const gameRef = doc(db, 'games', gameId);
    const playersRef = collection(db, 'games', gameId, 'players');

    const batch = writeBatch(db);

    batch.update(gameRef, { estadoRonda: 'en_curso' });

    const playersSnapshot = await getDocs(playersRef);
    playersSnapshot.docs.forEach((playerDoc) => {
      batch.update(playerDoc.ref, { bloqueadoEstaRonda: false });
    });

    await batch.commit();
  },

  endRound: async (gameId) => {
    const gameRef = doc(db, 'games', gameId);
    await updateDoc(gameRef, { estadoRonda: 'finalizada' });
  },

  nextRound: async (gameId) => {
    const gameRef = doc(db, 'games', gameId);
    const playersRef = collection(db, 'games', gameId, 'players');

    const batch = writeBatch(db);

    const gameDoc = await getDoc(gameRef);
    const currentRound = gameDoc.data().rondaActual;

    batch.update(gameRef, {
      rondaActual: currentRound + 1,
      estadoRonda: 'esperando',
    });

    const playersSnapshot = await getDocs(playersRef);
    playersSnapshot.docs.forEach((playerDoc) => {
      batch.update(playerDoc.ref, { bloqueadoEstaRonda: false });
    });

    await batch.commit();
  },

  addBuzz: async (gameId, playerId, nombreJugador, numeroRonda) => {
    const buzzData = {
      playerId,
      nombreJugador,
      numeroRonda,
      timestamp: serverTimestamp(),
      resuelta: false,
    };

    const buzzesRef = collection(db, 'games', gameId, 'buzzes');
    await addDoc(buzzesRef, buzzData);
  },

  resolveBuzzCorrect: async (gameId, buzzId, playerId) => {
    await runTransaction(db, async (transaction) => {
      const playersRef = collection(db, 'games', gameId, 'players');
      const q = query(playersRef, where('uid', '==', playerId));
      const playerSnapshot = await getDocs(q);

      if (playerSnapshot.empty) {
        throw new Error('Jugador no encontrado.');
      }

      const playerDoc = playerSnapshot.docs[0];
      const playerRef = playerDoc.ref;
      const playerData = playerDoc.data();

      transaction.update(playerRef, {
        puntaje: playerData.puntaje + 1,
      });

      const buzzRef = doc(db, 'games', gameId, 'buzzes', buzzId);
      transaction.update(buzzRef, { resuelta: true });
    });
  },

  resolveBuzzIncorrect: async (gameId, buzzId, playerId) => {
    await runTransaction(db, async (transaction) => {
      const playersRef = collection(db, 'games', gameId, 'players');
      const q = query(playersRef, where('uid', '==', playerId));
      const playerSnapshot = await getDocs(q);

      if (playerSnapshot.empty) {
        throw new Error('Jugador no encontrado.');
      }

      const playerDoc = playerSnapshot.docs[0];
      const playerRef = playerDoc.ref;
      const playerData = playerDoc.data();

      transaction.update(playerRef, {
        puntaje: playerData.puntaje - 1,
        bloqueadoEstaRonda: true,
      });

      const buzzRef = doc(db, 'games', gameId, 'buzzes', buzzId);
      transaction.update(buzzRef, { resuelta: true });
    });
  },

  endGame: async (gameId) => {
    const gameRef = doc(db, 'games', gameId);
    await updateDoc(gameRef, { estado: 'finalizada' });
  },

  // SOLO MODE SERVICES
  createSoloGame: async (creatorId, creatorName = 'Jugador') => {
    const generateGameCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    const codeExists = async (codigo) => {
      const q = query(collection(db, 'soloGames'), where('codigo', '==', codigo));
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    };

    let codigo = generateGameCode();
    while (await codeExists(codigo)) {
      codigo = generateGameCode();
    }

    const gameData = {
      codigo,
      creadorId: creatorId,
      tipo: 'solo',
      estado: 'activa',
      rondaActual: 1,
      estadoRonda: 'esperando', // esperando, en_curso, evaluando, finalizada
      creadaEn: serverTimestamp(),
      tiempoRespuesta: 20, // seconds
      firstBuzzPlayerId: null,
      firstBuzzTimestamp: null,
    };

    const gameRef = doc(collection(db, 'soloGames'));
    await setDoc(gameRef, gameData);

    // Add creator as first player
    const playerData = {
      uid: creatorId,
      nombre: creatorName,
      puntaje: 0,
      bloqueadoEstaRonda: false,
      creadoEn: serverTimestamp(),
    };

    const playersRef = collection(db, 'soloGames', gameRef.id, 'players');
    await addDoc(playersRef, playerData);

    return { gameId: gameRef.id, codigo };
  },

  findSoloGameByCode: async (codigo) => {
    const q = query(
      collection(db, 'soloGames'),
      where('codigo', '==', codigo.toUpperCase()),
      where('estado', '==', 'activa')
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    const gameDoc = snapshot.docs[0];
    return { gameId: gameDoc.id, gameData: gameDoc.data() };
  },

  joinSoloGame: async (gameId, playerId, nombre) => {
    const playersRef = collection(db, 'soloGames', gameId, 'players');
    const q = query(playersRef, where('uid', '==', playerId));
    const existingPlayers = await getDocs(q);

    if (!existingPlayers.empty) {
      return existingPlayers.docs[0].id;
    }

    const playerData = {
      uid: playerId,
      nombre,
      puntaje: 0,
      bloqueadoEstaRonda: false,
      creadoEn: serverTimestamp(),
    };

    const playerRef = await addDoc(playersRef, playerData);
    return playerRef.id;
  },

  listenToSoloGame: (gameId, callback) => {
    const gameRef = doc(db, 'soloGames', gameId);
    return onSnapshot(
      gameRef,
      (snapshot) => {
        if (snapshot.exists()) {
          callback({ id: snapshot.id, ...snapshot.data() });
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('Error listening to solo game:', error);
        callback(null);
      }
    );
  },

  listenToSoloPlayers: (gameId, callback) => {
    const playersRef = collection(db, 'soloGames', gameId, 'players');
    return onSnapshot(
      playersRef,
      (snapshot) => {
        const players = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(players);
      },
      (error) => {
        console.error('Error listening to solo players:', error);
        callback([]);
      }
    );
  },

  listenToSoloPlayer: (gameId, playerId, callback) => {
    const playersRef = collection(db, 'soloGames', gameId, 'players');
    const q = query(playersRef, where('uid', '==', playerId));

    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const playerDoc = snapshot.docs[0];
          callback({ id: playerDoc.id, ...playerDoc.data() });
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('Error listening to solo player:', error);
        callback(null);
      }
    );
  },

  // When a player buzzes in solo mode
  submitFirstBuzz: async (gameId, playerId, nombreJugador) => {
    const gameRef = doc(db, 'soloGames', gameId);

    // Use transaction to ensure only first buzz is recorded
    return await runTransaction(db, async (transaction) => {
      const gameDoc = await transaction.get(gameRef);

      if (!gameDoc.exists()) {
        throw new Error('Partida no encontrada.');
      }

      const gameData = gameDoc.data();

      // Check if someone already buzzed
      if (gameData.firstBuzzPlayerId) {
        throw new Error('Otro jugador ya presionó primero.');
      }

      // Check if round is in progress
      if (gameData.estadoRonda !== 'en_curso') {
        throw new Error('La ronda no está en curso.');
      }

      // Set first buzz
      transaction.update(gameRef, {
        firstBuzzPlayerId: playerId,
        firstBuzzPlayerName: nombreJugador,
        firstBuzzTimestamp: serverTimestamp(),
        estadoRonda: 'esperando_respuesta', // waiting for answer
      });

      return true;
    });
  },

  // Submit answer for current round
  submitAnswer: async (gameId, playerId, nombreJugador, respuesta, numeroRonda) => {
    const answersRef = collection(db, 'soloGames', gameId, 'answers');

    // Check if player already answered this round
    const q = query(
      answersRef,
      where('playerId', '==', playerId),
      where('numeroRonda', '==', numeroRonda)
    );
    const existing = await getDocs(q);

    if (!existing.empty) {
      throw new Error('Ya enviaste una respuesta para esta ronda.');
    }

    const answerData = {
      playerId,
      nombreJugador,
      respuesta: respuesta.trim(),
      numeroRonda,
      timestamp: serverTimestamp(),
      evaluada: false,
      esCorrecta: false,
      puntos: 0,
    };

    await addDoc(answersRef, answerData);
  },

  // Listen to answers for a specific round
  listenToRoundAnswers: (gameId, roundNumber, callback) => {
    const answersRef = collection(db, 'soloGames', gameId, 'answers');
    const q = query(
      answersRef,
      where('numeroRonda', '==', roundNumber),
      orderBy('timestamp', 'asc')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const answers = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(answers);
      },
      (error) => {
        console.error('Error listening to answers:', error);
        callback([]);
      }
    );
  },

  // Vote to skip song (when players don't know)
  voteSkipSong: async (gameId, playerId) => {
    const gameRef = doc(db, 'soloGames', gameId);
    const skipVotesRef = collection(db, 'soloGames', gameId, 'skipVotes');

    const gameDoc = await getDoc(gameRef);
    if (!gameDoc.exists()) {
      throw new Error('Partida no encontrada.');
    }

    const currentRound = gameDoc.data().rondaActual;

    // Check if player already voted
    const q = query(
      skipVotesRef,
      where('playerId', '==', playerId),
      where('numeroRonda', '==', currentRound)
    );
    const existing = await getDocs(q);

    if (!existing.empty) {
      throw new Error('Ya votaste para saltear esta canción.');
    }

    // Add vote
    await addDoc(skipVotesRef, {
      playerId,
      numeroRonda: currentRound,
      timestamp: serverTimestamp(),
    });

    // Check if all players voted to skip
    const playersRef = collection(db, 'soloGames', gameId, 'players');
    const playersSnapshot = await getDocs(playersRef);
    const totalPlayers = playersSnapshot.size;

    const allVotesSnapshot = await getDocs(query(skipVotesRef, where('numeroRonda', '==', currentRound)));
    const totalVotes = allVotesSnapshot.size;

    // If all players voted, skip to next round
    if (totalVotes >= totalPlayers) {
      await updateDoc(gameRef, {
        estadoRonda: 'finalizada',
      });
    }
  },

  // Listen to skip votes for current round
  listenToSkipVotes: (gameId, roundNumber, callback) => {
    const skipVotesRef = collection(db, 'soloGames', gameId, 'skipVotes');
    const q = query(
      skipVotesRef,
      where('numeroRonda', '==', roundNumber)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const votes = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(votes);
      },
      (error) => {
        console.error('Error listening to skip votes:', error);
        callback([]);
      }
    );
  },

  // Evaluate answers and determine best answer
  evaluateSoloRoundAnswers: async (gameId, correctAnswer) => {
    const gameRef = doc(db, 'soloGames', gameId);
    const gameDoc = await getDoc(gameRef);

    if (!gameDoc.exists()) {
      throw new Error('Partida no encontrada.');
    }

    const currentRound = gameDoc.data().rondaActual;
    const answersRef = collection(db, 'soloGames', gameId, 'answers');
    const q = query(answersRef, where('numeroRonda', '==', currentRound));
    const answersSnapshot = await getDocs(q);

    const batch = writeBatch(db);

    // Evaluate each answer
    const playersToUpdate = {};
    answersSnapshot.docs.forEach((answerDoc) => {
      const answer = answerDoc.data();
      const isCorrect = answer.respuesta.toLowerCase().includes(correctAnswer.toLowerCase()) ||
                        correctAnswer.toLowerCase().includes(answer.respuesta.toLowerCase());

      batch.update(answerDoc.ref, {
        evaluada: true,
        esCorrecta: isCorrect,
        puntos: isCorrect ? 1 : 0,
      });

      if (!playersToUpdate[answer.playerId]) {
        playersToUpdate[answer.playerId] = { correct: 0, incorrect: 0 };
      }

      if (isCorrect) {
        playersToUpdate[answer.playerId].correct += 1;
      } else {
        playersToUpdate[answer.playerId].incorrect += 1;
      }
    });

    // Update player scores
    const playersRef = collection(db, 'soloGames', gameId, 'players');
    for (const [playerId, result] of Object.entries(playersToUpdate)) {
      const playerQuery = query(playersRef, where('uid', '==', playerId));
      const playerSnapshot = await getDocs(playerQuery);

      if (!playerSnapshot.empty) {
        const playerDoc = playerSnapshot.docs[0];
        const currentScore = playerDoc.data().puntaje || 0;
        const scoreChange = result.correct - result.incorrect;

        batch.update(playerDoc.ref, {
          puntaje: Math.max(0, currentScore + scoreChange),
        });
      }
    }

    await batch.commit();
  },

  // Start solo game round
  startSoloRound: async (gameId) => {
    const gameRef = doc(db, 'soloGames', gameId);
    const playersRef = collection(db, 'soloGames', gameId, 'players');

    const batch = writeBatch(db);

    batch.update(gameRef, {
      estadoRonda: 'en_curso',
      firstBuzzPlayerId: null,
      firstBuzzPlayerName: null,
      firstBuzzTimestamp: null,
    });

    const playersSnapshot = await getDocs(playersRef);
    playersSnapshot.docs.forEach((playerDoc) => {
      batch.update(playerDoc.ref, { bloqueadoEstaRonda: false });
    });

    await batch.commit();
  },

  // End solo round
  endSoloRound: async (gameId) => {
    const gameRef = doc(db, 'soloGames', gameId);
    await updateDoc(gameRef, { estadoRonda: 'finalizada' });
  },

  // Next solo round
  nextSoloRound: async (gameId) => {
    const gameRef = doc(db, 'soloGames', gameId);
    const playersRef = collection(db, 'soloGames', gameId, 'players');

    const batch = writeBatch(db);

    const gameDoc = await getDoc(gameRef);
    const currentRound = gameDoc.data().rondaActual;

    batch.update(gameRef, {
      rondaActual: currentRound + 1,
      estadoRonda: 'esperando',
      firstBuzzPlayerId: null,
      firstBuzzPlayerName: null,
      firstBuzzTimestamp: null,
    });

    const playersSnapshot = await getDocs(playersRef);
    playersSnapshot.docs.forEach((playerDoc) => {
      batch.update(playerDoc.ref, { bloqueadoEstaRonda: false });
    });

    await batch.commit();
  },

  // End solo game
  endSoloGame: async (gameId) => {
    const gameRef = doc(db, 'soloGames', gameId);
    await updateDoc(gameRef, { estado: 'finalizada' });
  },
};

// Export unified API
export const createGame = async (...args) => {
  if (USE_MOCK_SERVICE) return mockGameService.createGame(...args);
  return realService.createGame(...args);
};

export const findGameByCode = async (...args) => {
  if (USE_MOCK_SERVICE) return mockGameService.findGameByCode(...args);
  return realService.findGameByCode(...args);
};

export const joinGame = async (...args) => {
  if (USE_MOCK_SERVICE) return mockGameService.joinGame(...args);
  return realService.joinGame(...args);
};

export const listenToGame = (...args) => {
  if (USE_MOCK_SERVICE) return mockGameService.listenToGame(...args);
  return realService.listenToGame(...args);
};

export const listenToPlayers = (...args) => {
  if (USE_MOCK_SERVICE) return mockGameService.listenToPlayers(...args);
  return realService.listenToPlayers(...args);
};

export const listenToBuzzes = (...args) => {
  if (USE_MOCK_SERVICE) return mockGameService.listenToBuzzes(...args);
  return realService.listenToBuzzes(...args);
};

export const listenToPlayer = (...args) => {
  if (USE_MOCK_SERVICE) return mockGameService.listenToPlayer(...args);
  return realService.listenToPlayer(...args);
};

export const startRound = async (...args) => {
  if (USE_MOCK_SERVICE) return mockGameService.startRound(...args);
  return realService.startRound(...args);
};

export const endRound = async (...args) => {
  if (USE_MOCK_SERVICE) return mockGameService.endRound(...args);
  return realService.endRound(...args);
};

export const nextRound = async (...args) => {
  if (USE_MOCK_SERVICE) return mockGameService.nextRound(...args);
  return realService.nextRound(...args);
};

export const addBuzz = async (...args) => {
  if (USE_MOCK_SERVICE) return mockGameService.addBuzz(...args);
  return realService.addBuzz(...args);
};

export const resolveBuzzCorrect = async (...args) => {
  if (USE_MOCK_SERVICE) return mockGameService.resolveBuzzCorrect(...args);
  return realService.resolveBuzzCorrect(...args);
};

export const resolveBuzzIncorrect = async (...args) => {
  if (USE_MOCK_SERVICE) return mockGameService.resolveBuzzIncorrect(...args);
  return realService.resolveBuzzIncorrect(...args);
};

export const endGame = async (...args) => {
  if (USE_MOCK_SERVICE) return mockGameService.endGame(...args);
  return realService.endGame(...args);
};

// Solo mode exports
export const createSoloGame = async (...args) => {
  if (USE_MOCK_SERVICE) return mockGameService.createSoloGame?.(...args) || realService.createSoloGame(...args);
  return realService.createSoloGame(...args);
};

export const findSoloGameByCode = async (...args) => {
  if (USE_MOCK_SERVICE) return mockGameService.findSoloGameByCode?.(...args) || realService.findSoloGameByCode(...args);
  return realService.findSoloGameByCode(...args);
};

export const joinSoloGame = async (...args) => {
  if (USE_MOCK_SERVICE) return mockGameService.joinSoloGame?.(...args) || realService.joinSoloGame(...args);
  return realService.joinSoloGame(...args);
};

export const listenToSoloGame = (...args) => {
  if (USE_MOCK_SERVICE) return mockGameService.listenToSoloGame?.(...args) || realService.listenToSoloGame(...args);
  return realService.listenToSoloGame(...args);
};

export const listenToSoloPlayers = (...args) => {
  if (USE_MOCK_SERVICE) return mockGameService.listenToSoloPlayers?.(...args) || realService.listenToSoloPlayers(...args);
  return realService.listenToSoloPlayers(...args);
};

export const listenToSoloPlayer = (...args) => {
  if (USE_MOCK_SERVICE) return mockGameService.listenToSoloPlayer?.(...args) || realService.listenToSoloPlayer(...args);
  return realService.listenToSoloPlayer(...args);
};

export const submitFirstBuzz = async (...args) => {
  if (USE_MOCK_SERVICE) return mockGameService.submitFirstBuzz?.(...args) || realService.submitFirstBuzz(...args);
  return realService.submitFirstBuzz(...args);
};

export const submitAnswer = async (...args) => {
  if (USE_MOCK_SERVICE) return mockGameService.submitAnswer?.(...args) || realService.submitAnswer(...args);
  return realService.submitAnswer(...args);
};

export const listenToRoundAnswers = (...args) => {
  if (USE_MOCK_SERVICE) return mockGameService.listenToRoundAnswers?.(...args) || realService.listenToRoundAnswers(...args);
  return realService.listenToRoundAnswers(...args);
};

export const voteSkipSong = async (...args) => {
  if (USE_MOCK_SERVICE) return mockGameService.voteSkipSong?.(...args) || realService.voteSkipSong(...args);
  return realService.voteSkipSong(...args);
};

export const listenToSkipVotes = (...args) => {
  if (USE_MOCK_SERVICE) return mockGameService.listenToSkipVotes?.(...args) || realService.listenToSkipVotes(...args);
  return realService.listenToSkipVotes(...args);
};

export const evaluateSoloRoundAnswers = async (...args) => {
  if (USE_MOCK_SERVICE) return mockGameService.evaluateSoloRoundAnswers?.(...args) || realService.evaluateSoloRoundAnswers(...args);
  return realService.evaluateSoloRoundAnswers(...args);
};

export const startSoloRound = async (...args) => {
  if (USE_MOCK_SERVICE) return mockGameService.startSoloRound?.(...args) || realService.startSoloRound(...args);
  return realService.startSoloRound(...args);
};

export const endSoloRound = async (...args) => {
  if (USE_MOCK_SERVICE) return mockGameService.endSoloRound?.(...args) || realService.endSoloRound(...args);
  return realService.endSoloRound(...args);
};

export const nextSoloRound = async (...args) => {
  if (USE_MOCK_SERVICE) return mockGameService.nextSoloRound?.(...args) || realService.nextSoloRound(...args);
  return realService.nextSoloRound(...args);
};

export const endSoloGame = async (...args) => {
  if (USE_MOCK_SERVICE) return mockGameService.endSoloGame?.(...args) || realService.endSoloGame(...args);
  return realService.endSoloGame(...args);
};
