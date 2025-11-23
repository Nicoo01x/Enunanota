/**
 * Mock Firebase service using localStorage
 * This allows the app to work without Firebase configuration
 * Perfect for development and testing on GitHub Pages
 */

// Generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Generate random game code
const generateGameCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// LocalStorage keys
const GAMES_KEY = 'enunanota_games';
const PLAYERS_KEY = 'enunanota_players';
const BUZZES_KEY = 'enunanota_buzzes';
const USER_ID_KEY = 'enunanota_userId';

// Get all games from localStorage
const getGames = () => {
  const games = localStorage.getItem(GAMES_KEY);
  return games ? JSON.parse(games) : {};
};

// Save games to localStorage
const saveGames = (games) => {
  localStorage.setItem(GAMES_KEY, JSON.stringify(games));
};

// Get all players from localStorage
const getPlayers = () => {
  const players = localStorage.getItem(PLAYERS_KEY);
  return players ? JSON.parse(players) : {};
};

// Save players to localStorage
const savePlayers = (players) => {
  localStorage.setItem(PLAYERS_KEY, JSON.stringify(players));
};

// Get all buzzes from localStorage
const getBuzzes = () => {
  const buzzes = localStorage.getItem(BUZZES_KEY);
  return buzzes ? JSON.parse(buzzes) : {};
};

// Save buzzes to localStorage
const saveBuzzes = (buzzes) => {
  localStorage.setItem(BUZZES_KEY, JSON.stringify(buzzes));
};

// Listeners for real-time updates
const listeners = {
  games: {},
  players: {},
  buzzes: {},
};

// Simulate real-time updates
const notifyListeners = (type, id = null) => {
  setTimeout(() => {
    if (type === 'games' && id && listeners.games[id]) {
      const games = getGames();
      listeners.games[id](games[id] || null);
    } else if (type === 'players' && id) {
      const players = getPlayers();
      const gamePlayers = Object.values(players).filter(p => p.gameId === id);
      if (listeners.players[id]) {
        listeners.players[id](gamePlayers);
      }
    } else if (type === 'buzzes' && id) {
      const buzzes = getBuzzes();
      const gameBuzzes = Object.values(buzzes).filter(b => b.gameId === id);
      if (listeners.buzzes[id]) {
        listeners.buzzes[id](gameBuzzes);
      }
    }
  }, 10);
};

// Mock Auth
export const mockAuth = {
  currentUser: null,

  signInAnonymous: async () => {
    let userId = localStorage.getItem(USER_ID_KEY);
    if (!userId) {
      userId = generateId();
      localStorage.setItem(USER_ID_KEY, userId);
    }
    mockAuth.currentUser = { uid: userId };
    return mockAuth.currentUser;
  },

  getCurrentUserId: () => {
    return mockAuth.currentUser?.uid || localStorage.getItem(USER_ID_KEY);
  },
};

// Mock Game Service
export const mockGameService = {
  // Create a new game
  createGame: async (hostId, hostName = 'Anfitrión') => {
    const games = getGames();
    const gameId = generateId();
    let codigo = generateGameCode();

    // Ensure unique code
    while (Object.values(games).some(g => g.codigo === codigo)) {
      codigo = generateGameCode();
    }

    games[gameId] = {
      id: gameId,
      codigo,
      hostId,
      hostName,
      estado: 'activa',
      rondaActual: 1,
      estadoRonda: 'esperando',
      creadaEn: Date.now(),
    };

    saveGames(games);
    return { gameId, codigo };
  },

  // Find game by code
  findGameByCode: async (codigo) => {
    const games = getGames();
    const game = Object.values(games).find(
      g => g.codigo === codigo.toUpperCase() && g.estado === 'activa'
    );

    if (!game) return null;

    return {
      gameId: game.id,
      gameData: game,
    };
  },

  // Join a game
  joinGame: async (gameId, playerId, nombre) => {
    const players = getPlayers();

    // Check if player already exists
    const existingPlayer = Object.values(players).find(
      p => p.gameId === gameId && p.uid === playerId
    );

    if (existingPlayer) {
      return existingPlayer.id;
    }

    const playerDocId = generateId();
    players[playerDocId] = {
      id: playerDocId,
      gameId,
      uid: playerId,
      nombre,
      puntaje: 0,
      bloqueadoEstaRonda: false,
      creadoEn: Date.now(),
    };

    savePlayers(players);
    notifyListeners('players', gameId);

    return playerDocId;
  },

  // Listen to game updates
  listenToGame: (gameId, callback) => {
    listeners.games[gameId] = callback;

    // Initial call
    const games = getGames();
    callback(games[gameId] || null);

    // Poll for updates every second
    const interval = setInterval(() => {
      const games = getGames();
      callback(games[gameId] || null);
    }, 1000);

    // Return unsubscribe function
    return () => {
      clearInterval(interval);
      delete listeners.games[gameId];
    };
  },

  // Listen to players
  listenToPlayers: (gameId, callback) => {
    listeners.players[gameId] = callback;

    // Initial call
    const players = getPlayers();
    const gamePlayers = Object.values(players).filter(p => p.gameId === gameId);
    callback(gamePlayers);

    // Poll for updates
    const interval = setInterval(() => {
      const players = getPlayers();
      const gamePlayers = Object.values(players).filter(p => p.gameId === gameId);
      callback(gamePlayers);
    }, 1000);

    return () => {
      clearInterval(interval);
      delete listeners.players[gameId];
    };
  },

  // Listen to buzzes
  listenToBuzzes: (gameId, roundNumber, callback) => {
    const key = `${gameId}_${roundNumber}`;
    listeners.buzzes[key] = callback;

    // Initial call
    const buzzes = getBuzzes();
    const roundBuzzes = Object.values(buzzes).filter(
      b => b.gameId === gameId && b.numeroRonda === roundNumber && !b.resuelta
    ).sort((a, b) => a.timestamp - b.timestamp);
    callback(roundBuzzes);

    // Poll for updates
    const interval = setInterval(() => {
      const buzzes = getBuzzes();
      const roundBuzzes = Object.values(buzzes).filter(
        b => b.gameId === gameId && b.numeroRonda === roundNumber && !b.resuelta
      ).sort((a, b) => a.timestamp - b.timestamp);
      callback(roundBuzzes);
    }, 500); // More frequent for buzzes

    return () => {
      clearInterval(interval);
      delete listeners.buzzes[key];
    };
  },

  // Listen to a specific player
  listenToPlayer: (gameId, playerId, callback) => {
    const key = `player_${gameId}_${playerId}`;
    listeners.players[key] = callback;

    // Initial call
    const players = getPlayers();
    const player = Object.values(players).find(
      p => p.gameId === gameId && p.uid === playerId
    );
    callback(player || null);

    // Poll for updates
    const interval = setInterval(() => {
      const players = getPlayers();
      const player = Object.values(players).find(
        p => p.gameId === gameId && p.uid === playerId
      );
      callback(player || null);
    }, 1000);

    return () => {
      clearInterval(interval);
      delete listeners.players[key];
    };
  },

  // Start round
  startRound: async (gameId) => {
    const games = getGames();
    const players = getPlayers();

    if (games[gameId]) {
      games[gameId].estadoRonda = 'en_curso';
      saveGames(games);

      // Reset all players' blocked status
      Object.keys(players).forEach(playerId => {
        if (players[playerId].gameId === gameId) {
          players[playerId].bloqueadoEstaRonda = false;
        }
      });
      savePlayers(players);

      notifyListeners('games', gameId);
      notifyListeners('players', gameId);
    }
  },

  // End round
  endRound: async (gameId) => {
    const games = getGames();

    if (games[gameId]) {
      games[gameId].estadoRonda = 'finalizada';
      saveGames(games);
      notifyListeners('games', gameId);
    }
  },

  // Next round
  nextRound: async (gameId) => {
    const games = getGames();
    const players = getPlayers();

    if (games[gameId]) {
      games[gameId].rondaActual += 1;
      games[gameId].estadoRonda = 'esperando';
      saveGames(games);

      // Reset all players' blocked status
      Object.keys(players).forEach(playerId => {
        if (players[playerId].gameId === gameId) {
          players[playerId].bloqueadoEstaRonda = false;
        }
      });
      savePlayers(players);

      notifyListeners('games', gameId);
      notifyListeners('players', gameId);
    }
  },

  // Add buzz
  addBuzz: async (gameId, playerId, nombreJugador, numeroRonda) => {
    const buzzes = getBuzzes();
    const buzzId = generateId();

    buzzes[buzzId] = {
      id: buzzId,
      gameId,
      playerId,
      nombreJugador,
      numeroRonda,
      timestamp: Date.now(),
      resuelta: false,
    };

    saveBuzzes(buzzes);
    notifyListeners('buzzes', gameId);
  },

  // Resolve buzz as correct
  resolveBuzzCorrect: async (gameId, buzzId, playerId) => {
    const players = getPlayers();
    const buzzes = getBuzzes();

    // Update player score
    const player = Object.values(players).find(
      p => p.gameId === gameId && p.uid === playerId
    );

    if (player) {
      players[player.id].puntaje += 1;
      savePlayers(players);
    }

    // Mark buzz as resolved
    if (buzzes[buzzId]) {
      buzzes[buzzId].resuelta = true;
      saveBuzzes(buzzes);
    }

    notifyListeners('players', gameId);
    notifyListeners('buzzes', gameId);
  },

  // Resolve buzz as incorrect
  resolveBuzzIncorrect: async (gameId, buzzId, playerId) => {
    const players = getPlayers();
    const buzzes = getBuzzes();

    // Update player score and block
    const player = Object.values(players).find(
      p => p.gameId === gameId && p.uid === playerId
    );

    if (player) {
      players[player.id].puntaje -= 1;
      players[player.id].bloqueadoEstaRonda = true;
      savePlayers(players);
    }

    // Mark buzz as resolved
    if (buzzes[buzzId]) {
      buzzes[buzzId].resuelta = true;
      saveBuzzes(buzzes);
    }

    notifyListeners('players', gameId);
    notifyListeners('buzzes', gameId);
  },

  // End game
  endGame: async (gameId) => {
    const games = getGames();

    if (games[gameId]) {
      games[gameId].estado = 'finalizada';
      saveGames(games);
      notifyListeners('games', gameId);
    }
  },
};
