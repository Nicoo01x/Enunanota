import { USE_MOCK_SERVICE, auth } from './config';
import { mockAuth } from './mockService';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

/**
 * Authentication wrapper
 * Uses mock auth (localStorage) or real Firebase auth
 */

/**
 * Sign in anonymously
 */
export const signInAnonymous = async () => {
  if (USE_MOCK_SERVICE) {
    return await mockAuth.signInAnonymous();
  }

  try {
    const userCredential = await signInAnonymously(auth);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in anonymously:', error);
    throw error;
  }
};

/**
 * Listen to auth state changes
 */
export const onAuthChange = (callback) => {
  if (USE_MOCK_SERVICE) {
    // Mock: just call callback with current user
    callback(mockAuth.currentUser);
    return () => {}; // No-op unsubscribe
  }

  return onAuthStateChanged(auth, callback);
};

/**
 * Get current user ID
 */
export const getCurrentUserId = () => {
  if (USE_MOCK_SERVICE) {
    return mockAuth.getCurrentUserId();
  }

  return auth?.currentUser?.uid || null;
};
