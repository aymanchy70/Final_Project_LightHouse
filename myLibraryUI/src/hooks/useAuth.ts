import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import type { AuthContextType } from '../types/auth.types';

/**
 * useAuth — consume the AuthContext anywhere in the app.
 *
 * Returns: { user, token, loading, error, isAuthenticated, isAdmin,
 *            login, register, logout, clearError }
 */
const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an <AuthProvider>');
  }
  return context;
};

export default useAuth;
