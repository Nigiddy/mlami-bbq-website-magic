
import React, { createContext } from 'react';
import { useAuthProvider } from './useAuthProvider';
import { AuthContextType } from './types';

export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  signIn: async () => {},
  signOut: async () => {},
  isLoading: true,
  isAdmin: false,
  isCook: false,
  roleChecked: false
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuthProvider();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};
