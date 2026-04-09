import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as SystemSplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Platform, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/Colors';

// Tell the native/web system to hold the default curtain
SystemSplashScreen.preventAutoHideAsync().catch(() => {});

export default function SplashScreen() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const prepareApp = async () => {
      try {
        // 1. Instantly rip down the HTML/Native curtain so our custom React screen is visible!
        await SystemSplashScreen.hideAsync();
        setIsReady(true);

        // 2. Check their storage memory
        const hasLaunched = await AsyncStorage.getItem('hasLaunched');
        
        // 3. Show our beautiful custom screen for exactly 3 seconds
        setTimeout(() => {
          if (hasLaunched === 'true') {
            router.replace('/(drawer)'); 
          } else {
            router.replace('/intro'); 
          }
        }, 2000);

      } catch (error) {
        setTimeout(() => router.replace('/intro'), 3000);
      }
    };

    prepareApp();
  }, []);

  // Don't draw the React tree until we've successfully dropped the system curtain
  if (!isReady) return null;

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('../assets/images/logo.png')} 
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.title}>AcuSpace</Text>
      <View style={styles.loader}>
        {/* INSPECTOR FIX: Removed the fallback ghost here */}
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
      <Text style={styles.footer}>Loading Wisdom...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Web-safe height fix added here (100% height ensures it doesn't collapse in the browser)
  container: { 
    flex: 1, 
    height: Platform.OS === 'web' ? '100vh' : '100%', 
    width: '100%', 
    // INSPECTOR FIX: Applied Master Background Token
    backgroundColor: Colors.background, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  
  logoContainer: {
    width: 140, 
    height: 140, 
    // INSPECTOR FIX: Applied Master Surface Token
    backgroundColor: Colors.surface, 
    borderRadius: 35,
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 20, 
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    overflow: 'hidden' 
  },
  
  logoImage: {
    width: '100%',
    height: '100%',
  },
  
  // INSPECTOR FIX: Applied Master Text Tokens
  title: { fontSize: 32, fontWeight: 'bold', color: Colors.textPrimary },
  loader: { marginBottom: 20 },
  footer: { position: 'absolute', bottom: 50, color: Colors.textSecondary, fontSize: 14 }
});