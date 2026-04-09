import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://glebimjvktjfaksytjpe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsZWJpbWp2a3RqZmFrc3l0anBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2Nzc2ODIsImV4cCI6MjA5MDI1MzY4Mn0.QhYF88ayLA_6ZBq-rZO0Nl3vfrwDZG4_ZuiWq7CITa0';

// --- NEW: Safe Storage Adapter ---
// This prevents the "window is not defined" error during web SSR builds
const safeStorage = {
  getItem: (key: string) => {
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined') return null; // Server-side fallback
      return window.localStorage.getItem(key);
    }
    return AsyncStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
      return;
    }
    AsyncStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') window.localStorage.removeItem(key);
      return;
    }
    AsyncStorage.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: safeStorage, // Now using our crash-proof adapter
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});