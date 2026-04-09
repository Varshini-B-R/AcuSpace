import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';

// --- NEW: Web-Safe SVG Icon ---
import { AlertTriangle } from 'lucide-react-native';

export default function DisclaimerScreen() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.warningBox}>
        {/* Replaced Ionicons warning with SVG AlertTriangle */}
        <AlertTriangle size={48} color={Colors.accent} style={{ marginBottom: 16 }} />
        <Text style={styles.title}>Medical Disclaimer</Text>
        
        <Text style={styles.text}>
          The content provided in this application, including text, graphics, images, and other material, is for <Text style={{fontWeight: 'bold', color: Colors.textPrimary}}>educational and informational purposes only</Text>.
        </Text>
        
        <Text style={styles.text}>
          This app is NOT intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
        </Text>
        
        <Text style={styles.text}>
          Never disregard professional medical advice or delay in seeking it because of something you have read in this application.
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => router.navigate('/')}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>I Understand</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: Colors.safetyBackground, 
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningBox: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.accent,
    marginBottom: 20,
    textAlign: 'center',
  },
  text: {
    fontSize: 15,
    lineHeight: 24, 
    color: Colors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: Colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: '100%',
    maxWidth: 300,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});