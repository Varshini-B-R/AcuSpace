import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { Colors } from '../../../constants/Colors';
import { CheckCircle } from 'lucide-react-native';

export default function IntakeFormScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [mainComplaint, setMainComplaint] = useState('');
  const [duration, setDuration] = useState('');
  const [tonguePulse, setTonguePulse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);



  const handleSubmit = async () => {
    if (!mainComplaint.trim()) {
      if (Platform.OS === 'web') {
        window.alert("Please provide your main complaint.");
      } else {
        Alert.alert("Required", "Please provide your main complaint.");
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // Ensure the ID is properly formatted as a string
      const appointmentId = Array.isArray(id) ? id[0] : id;
      
      const intakeData = {
        main_complaint: mainComplaint,
        duration: duration,
        tongue_pulse_notes: tonguePulse
      };

      const { data, error } = await supabase
        .from('appointments')
        .update({ 
          intake_completed: true, 
          intake_data: intakeData 
        })
        .eq('id', appointmentId)
        .select(); // <-- We added .select() so we can check if it ACTUALLY updated!

      if (error) throw error;

      // The RLS Safeguard: If it returns 0 rows, the security policy blocked it
      if (!data || data.length === 0) {
        throw new Error("Update blocked by database security. Please run the RLS SQL command.");
      }

      // 1. Turn OFF the spinner FIRST
      setIsSubmitting(false);

      // 2. Show the alert
      if (Platform.OS === 'web') {
        window.alert("Intake submitted successfully!");
      } else {
        Alert.alert("Success", "Intake submitted successfully!");
      }

      // 3. Route back to the profile
      router.replace('/(drawer)/profile'); 

    } catch (error: any) {
      // Turn off spinner if there is an error
      setIsSubmitting(false);
      
      if (Platform.OS === 'web') {
        window.alert(error.message);
      } else {
        Alert.alert("Error", error.message);
      }
    }
  };

  return (
    <>
      {/* Allows your global layout header to take over smoothly */}
      <Stack.Screen options={{ title: 'Pre-Session Intake', headerShown: true }} />

      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.formContainer}>
          <Text style={styles.disclaimer}>
            Please complete this brief form. Your therapist will review these details before your video session begins.
          </Text>

          <Text style={styles.label}>1. What is your main complaint today? *</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            placeholder="e.g., Lower back pain, insomnia, digestion issues..."
            multiline 
            value={mainComplaint} 
            onChangeText={setMainComplaint} 
          />

          <Text style={styles.label}>2. How long have you been experiencing this?</Text>
          <TextInput 
            style={styles.input} 
            placeholder="e.g., 3 weeks, 2 years..."
            value={duration} 
            onChangeText={setDuration} 
          />

          <Text style={styles.label}>3. Any specific observations? (Tongue/Pulse/Digestion)</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            placeholder="e.g., Tongue has thick white coating, trouble sleeping through the night..."
            multiline 
            value={tonguePulse} 
            onChangeText={setTonguePulse} 
          />

          <TouchableOpacity 
            style={styles.submitBtn} 
            onPress={handleSubmit} 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <CheckCircle size={20} color="#FFF" />
                <Text style={styles.submitBtnText}>Submit & Unlock Video Room</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  formContainer: { padding: 20, paddingTop: 30, maxWidth: 800, alignSelf: 'center', width: '100%' }, 
  
  disclaimer: { fontSize: 14, color: Colors.textSecondary, marginBottom: 24, lineHeight: 22, backgroundColor: '#FAFAF5', borderWidth: 1, borderColor: '#EAEAEA', padding: 12, borderRadius: 8, overflow: 'hidden' },
  
  label: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary, marginBottom: 8 },
  input: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: '#EAEAEA', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, marginBottom: 20 },
  textArea: { height: 100, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, marginTop: 10, gap: 8 },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});