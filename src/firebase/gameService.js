import { USE_MOCK_SERVICE } from './config';
import { mockGameService } from './mockService';

/**
 * Game Service wrapper
 * Uses mock service (localStorage) or real Firebase Firestore
 */

// Real Firebase service (lazy loaded)
let realService = null;

const initRealService = async () => {
  if (!USE_MOCK_SERVICE && !realService) {
    const {
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
    } = await import('firebase/firestore');

    const { db } = await import('./config');

    // Implementation of real Firebase functions
    realService = {
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
    };
  }
};

// Export unified API
export const createGame = async (...args) => {
  if (USE_MOCK_SERVICE) return mockGameService.createGame(...args);
  await initRealService();
  return realService.createGame(...args);
};

export const findGameByCode = async (...args) => {
  if (USE_MOCK_SERVICE) return mockGameService.findGameByCode(...args);
  await initRealService();
  return realService.findGameByCode(...args);
};

export const joinGame = async (...args) => {
  if (USE_MOCK_SERVICE) return mockGameService.joinGame(...args);
  await initRealService();
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
  await initRealService();
  return realService.startRound(...args);
};

export const endRound = async (...args) => {
  if (USE_MOCK_SERVICE) return mockGameService.endRound(...args);
  await initRealService();
  return realService.endRound(...args);
};

export const nextRound = async (...args) => {
  if (USE_MOCK_SERVICE) return mockGameService.nextRound(...args);
  await initRealService();
  return realService.nextRound(...args);
};

export const addBuzz = async (...args) => {
  if (USE_MOCK_SERVICE) return mockGameService.addBuzz(...args);
  await initRealService();
  return realService.addBuzz(...args);
};

export const resolveBuzzCorrect = async (...args) => {
  if (USE_MOCK_SERVICE) return mockGameService.resolveBuzzCorrect(...args);
  await initRealService();
  return realService.resolveBuzzCorrect(...args);
};

export const resolveBuzzIncorrect = async (...args) => {
  if (USE_MOCK_SERVICE) return mockGameService.resolveBuzzIncorrect(...args);
  await initRealService();
  return realService.resolveBuzzIncorrect(...args);
};

export const endGame = async (...args) => {
  if (USE_MOCK_SERVICE) return mockGameService.endGame(...args);
  await initRealService();
  return realService.endGame(...args);
};
