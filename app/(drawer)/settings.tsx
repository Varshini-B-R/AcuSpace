import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useUser } from '../../context/UserContext';

// --- NEW: Web-Safe SVG Icons ---
import { ChevronRight, Mail, ShieldCheck } from 'lucide-react-native';

export default function SettingsScreen() {
  const { isSubscribed, toggleSubscription } = useUser() || { isSubscribed: false, toggleSubscription: () => {} };
  const router = useRouter();

  const handleLink = (link: string) => {
    Alert.alert("Coming Soon", `This will open: ${link}`);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      

      {/* Section: General */}
      <Text style={styles.sectionHeader}>GENERAL</Text>
      <View style={styles.card}>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.rowItem} onPress={() => router.push('/(drawer)/about')}>
          <Text style={styles.settingTitle}>About TCM</Text>
          {/* Replaced Ionicons chevron-forward with SVG ChevronRight */}
          <ChevronRight size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Section: Support */}
      <Text style={styles.sectionHeader}>SUPPORT</Text>
      <View style={styles.card}>
        <TouchableOpacity style={styles.rowItem} onPress={() => router.push('/(drawer)/contact')}>
          <Text style={styles.settingTitle}>Contact Us</Text>
          {/* Replaced Ionicons mail-outline with SVG Mail */}
          <Mail size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.rowItem} onPress={() => router.push('/(drawer)/disclaimer')}>
          <Text style={styles.settingTitle}>Privacy & Disclaimer</Text>
          {/* Replaced Ionicons shield-checkmark-outline with SVG ShieldCheck */}
          <ShieldCheck size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.versionText}>Version 1.0.0 (Build 101)</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 20 },
  
  sectionHeader: { fontSize: 13, fontWeight: 'bold', color: Colors.textSecondary, marginBottom: 10, marginTop: 10, marginLeft: 5 },
  
  card: { 
    backgroundColor: Colors.surface, 
    borderRadius: 16, 
    paddingHorizontal: 16, 
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 },
  rowItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 },
  divider: { height: 1, backgroundColor: '#F0F0F0' }, 
  
  settingTitle: { fontSize: 16, color: Colors.textPrimary },
  settingSubtitle: { fontSize: 13, color: Colors.primary, marginTop: 2 },
  versionText: { textAlign: 'center', color: Colors.textSecondary, fontSize: 13, marginTop: 10, marginBottom: 40 },
});