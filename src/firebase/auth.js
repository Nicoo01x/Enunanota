import { USE_MOCK_SERVICE } from './config';
import { mockAuth } from './mockService';

/**
 * Authentication wrapper
 * Uses mock auth (localStorage) or real Firebase auth
 */

let realAuth = null;

// Initialize real Firebase auth if not using mock
const initRealAuth = async () => {
  if (!USE_MOCK_SERVICE && !realAuth) {
    const { auth } = await import('./config');
    const { signInAnonymously, onAuthStateChanged } = await import('firebase/auth');
    realAuth = { auth, signInAnonymously, onAuthStateChanged };
  }
};

/**
 * Sign in anonymously
 */
export const signInAnonymous = async () => {
  if (USE_MOCK_SERVICE) {
    return await mockAuth.signInAnonymous();
  }

  await initRealAuth();
  try {
    const userCredential = await realAuth.signInAnonymously(realAuth.auth);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in anonymously:', error);
    throw error;
  }
};

/**
 * Listen to auth state changes
 */
export const onAuthChange = async (callback) => {
  if (USE_MOCK_SERVICE) {
    // Mock: just call callback with current user
    callback(mockAuth.currentUser);
    return () => {}; // No-op unsubscribe
  }

  await initRealAuth();
  return realAuth.onAuthStateChanged(realAuth.auth, callback);
};

/**
 * Get current user ID
 */
export const getCurrentUserId = () => {
  if (USE_MOCK_SERVICE) {
    return mockAuth.getCurrentUserId();
  }

  const { auth } = require('./config');
  return auth?.currentUser?.uid || null;
};
