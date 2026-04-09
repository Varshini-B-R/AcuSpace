import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Colors } from '../constants/Colors';
import { UserProvider } from '../context/UserContext';
import { AuthProvider } from '../lib/AuthContext';

// Forcefully hunt down and destroy the web splash screen DOM element
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  setTimeout(() => {
    const splash = document.getElementById('expo-splash-screen');
    if (splash) {
      splash.remove();
    }
  }, 10); // 10ms delay ensures the DOM is ready to be edited
}

// 1. Check the platform before locking the splash screen
if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync();
} else {
  // Force it to hide immediately on web just to be safe
  SplashScreen.hideAsync();
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <UserProvider>
        <GestureHandlerRootView style={styles.container}>
          <Stack initialRouteName="index">
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="intro" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="(drawer)" options={{ headerShown: false, gestureEnabled: false }} />
           
            
            {/* Existing Routes */}
            <Stack.Screen 
              name="meridian/[id]" 
              options={{ title: 'Meridian Details', headerBackTitle: 'Back', headerTintColor: Colors.primary }} 
            />
            <Stack.Screen 
              name="meridian/point/[code]" 
              options={{ title: 'Point Details', headerBackTitle: 'Back', headerTintColor: Colors.primary }} 
            />
          </Stack>
          <StatusBar style="dark" backgroundColor={Colors.background} />
        </GestureHandlerRootView>
      </UserProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({ 
  container: { flex: 1, backgroundColor: Colors.background } 
});