import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview'; 
import { ArrowLeft, ShieldAlert } from 'lucide-react-native';

import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/AuthContext';
import { Colors } from '../../constants/Colors';

export default function VideoCallScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const { room_id } = useLocalSearchParams(); 
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (session?.user?.id) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', session.user.id)
          .single();
        setProfile(data);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [session]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Connecting to secure room...</Text>
      </View>
    );
  }

  if (!session || !room_id) {
    return (
      <View style={styles.centerContainer}>
        <ShieldAlert size={48} color="#EF4444" style={{ marginBottom: 16 }} />
        <Text style={styles.errorText}>Invalid Meeting Link.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Generate the unique URL with Strict Responsive Configs
  const jitsiRoomName = `AcuSpace-Consultation-${room_id}`;
  const displayName = profile?.full_name || 'AcuSpace User';
  
  // Notice we added config.prejoinPageEnabled=false to skip that weird split-screen lobby!
  const meetingUrl = `https://meet.jit.si/${jitsiRoomName}#config.prejoinPageEnabled=false&config.disableDeepLinking=true&userInfo.displayName="${encodeURIComponent(displayName)}"`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.leaveButton}>
          <ArrowLeft size={20} color="#EF4444" />
          <Text style={styles.leaveText}>Leave Room</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Telehealth Session</Text>
        <View style={{ width: 60 }} /> 
      </View>

      {/* Responsive Cross-Platform Video Engine */}
      <View style={styles.videoContainer}>
        {Platform.OS === 'web' ? (
          /* WEB BROWSER RENDERING */
          <iframe
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            src={meetingUrl}
            style={{ 
              width: '100%', 
              height: '100%', 
              border: 'none',
              minHeight: '85vh', /* Forces the iframe to stretch on web */
              display: 'block' 
            }}
          />
        ) : (
          /* MOBILE APP RENDERING (Works in Expo Go!) */
          <WebView
            source={{ uri: meetingUrl }}
            style={{ flex: 1, width: '100%', height: '100%' }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowsInlineMediaPlayback={true} // Crucial for iOS
            mediaPlaybackRequiresUserAction={false}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' }, 
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background, padding: 20 },
  loadingText: { marginTop: 16, fontSize: 16, color: Colors.textSecondary, fontWeight: '500' },
  errorText: { fontSize: 18, color: Colors.textPrimary, fontWeight: '600', marginBottom: 24 },
  
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    backgroundColor: '#111', 
    paddingTop: Platform.OS === 'ios' ? 50 : 20, 
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333'
  },
  headerTitle: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  leaveButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#2A1010', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  leaveText: { color: '#EF4444', fontWeight: '600', fontSize: 14 },
  
  backButton: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  backButtonText: { color: '#FFF', fontWeight: '600', fontSize: 16 },
  
  videoContainer: { flex: 1, backgroundColor: '#000' }
});