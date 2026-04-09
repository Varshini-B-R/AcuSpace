import React, { createContext, useState, useContext, useEffect } from 'react';

interface UserContextType {
  isSubscribed: boolean;
  toggleSubscription: () => void;
  favorites: string[]; // List of saved point IDs (e.g., ['LU1', 'LI4'])
  toggleFavorite: (code: string) => void;
  isFavorite: (code: string) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Toggle Subscription (Simulates buying Premium)
  const toggleSubscription = () => {
    setIsSubscribed((prev) => !prev);
  };

  // Add or Remove a Favorite
  const toggleFavorite = (code: string) => {
    setFavorites((prev) => {
      if (prev.includes(code)) {
        return prev.filter((id) => id !== code); // Remove it
      } else {
        return [...prev, code]; // Add it
      }
    });
  };

  // Check if a point is saved
  const isFavorite = (code: string) => favorites.includes(code);

  return (
    <UserContext.Provider value={{ isSubscribed, toggleSubscription, favorites, toggleFavorite, isFavorite }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}