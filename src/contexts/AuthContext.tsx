import React, { createContext, useContext, useEffect, useState } from 'react';

interface Profile {
  id: string;
  user_id: string;
  name: string;
  phone?: string;
  address?: string;
  aadhaar_number?: string;
  role: 'farmer' | 'distributor' | 'admin';
  location?: string;
  crops_grown?: string[];
}

interface AuthContextType {
  user: any | null;
  session: any | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: {
    name: string;
    phone: string;
    address: string;
    aadhaar_number: string;
    role: 'farmer' | 'distributor' | 'admin';
  }) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Instead of throwing an error, return null values
    return {
      user: null,
      session: null,
      profile: null,
      loading: false,
      signUp: async () => ({ error: new Error('AuthProvider not found') }),
      signIn: async () => ({ error: new Error('AuthProvider not found') }),
      signOut: async () => {},
      resetPassword: async () => ({ error: new Error('AuthProvider not found') })
    };
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>({ id: 'mock-user', email: 'mock@example.com' });
  const [session, setSession] = useState<any>({ user: { id: 'mock-user', email: 'mock@example.com' } });
  const [profile, setProfile] = useState<Profile>({
    id: 'mock-profile',
    user_id: 'mock-user',
    name: 'Mock Farmer',
    phone: '1234567890',
    address: 'Mock Address',
    aadhaar_number: '123456789012',
    role: 'farmer',
    location: 'Mock Location',
    crops_grown: ['Rice', 'Wheat']
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Mock auth - always logged in
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, userData: {
    name: string;
    phone: string;
    address: string;
    aadhaar_number: string;
    role: 'farmer' | 'distributor' | 'admin';
  }) => {
    // Mock signup - always success
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    // Mock signin - always success
    return { error: null };
  };

  const signOut = async () => {
    // Mock signout
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const resetPassword = async (email: string) => {
    // Mock reset
    return { error: null };
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};