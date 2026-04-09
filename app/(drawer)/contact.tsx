import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';

// --- NEW: Web-Safe SVG Icons ---
import { MessageSquare, Sparkles } from 'lucide-react-native';

export default function ContactScreen() {
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState(''); 
  const [message, setMessage] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    if (name.trim().length < 2) {
      setErrorMessage("⚠️ Please enter your full name.");
      return;
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone.trim())) {
      setErrorMessage("⚠️ Please enter a valid 10-digit phone number.");
      return;
    }

    if (message.trim().length < 5) {
      setErrorMessage("⚠️ Please enter a longer message before sending.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(''); 

    // --- EMAILJS INTEGRATION START ---
    const payload = {
      service_id: 'service_f0r5s3m',             // Your Gmail Service ID
      template_id: 'template_v1f0oeb',   // <-- PASTE YOUR CONTACT TEMPLATE ID HERE
      user_id: 'uyrAhpSIYeVaQQ3UZ',                // <-- PASTE YOUR PUBLIC KEY HERE
      template_params: {
        from_name: name.trim(),
        phone_number: phone.trim(),
        message: message.trim(),
        app_source: 'AcuSpace Mobile App'
      }
    };

    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // EmailJS returns standard HTTP status codes (200 OK for success)
      if (response.ok) {
        setIsSuccess(true);
      } else {
        const errorText = await response.text();
        console.error("EmailJS Error details:", errorText);
        setErrorMessage("❌ Failed to send message. Please try again.");
      }
    } catch (error) {
      setErrorMessage("❌ Network error. Please check your connection.");
    } finally {
      setIsSubmitting(false); 
    }
    // --- EMAILJS INTEGRATION END ---
  };

  if (isSuccess) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successCard}>
          {/* Replaced Ionicons with SVG Sparkles */}
          <Sparkles size={48} color={Colors.accent} style={{ marginBottom: 15 }} />
          <Text style={styles.successTitle}>Thank You, {name.trim()}</Text>
          <Text style={styles.successBody}>
            Your details have been securely received. We appreciate you reaching out to help us improve AcuSpace. We will review your message and contact you shortly.
          </Text>
          <TouchableOpacity style={styles.returnBtn} onPress={() => router.back()}>
            <Text style={styles.returnBtnText}>Return to AcuSpace</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: Colors.background }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView 
        contentContainerStyle={styles.container} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled" 
      >
        <View style={styles.header}>
          {/* Replaced Ionicons with SVG MessageSquare */}
          <MessageSquare size={54} color={Colors.primary} />
          <Text style={styles.title}>We'd Love to Hear From You</Text>
          <Text style={styles.subtitle}>Have a suggestion, complaint, or just want to say hello?</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.label}>Your Name</Text>
          <TextInput
            style={[styles.input, { minHeight: 50, marginBottom: 20 }]}
            placeholder="Adithya"
            value={name}
            onChangeText={setName}
            editable={!isSubmitting} 
          />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={[styles.input, { minHeight: 50, marginBottom: 20 }]}
            placeholder="e.g. 9876543210"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={10} 
            editable={!isSubmitting} 
          />

          <Text style={styles.label}>Your Message</Text>
          <TextInput
            style={styles.input}
            multiline
            numberOfLines={6}
            placeholder="Type your message here..."
            value={message}
            onChangeText={setMessage}
            textAlignVertical="top"
            editable={!isSubmitting} 
          />
          
          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          <TouchableOpacity 
            style={[styles.button, isSubmitting && styles.buttonDisabled]} 
            onPress={handleSubmit} 
            activeOpacity={0.8}
            disabled={isSubmitting} 
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Send Message</Text>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>Email Support</Text>
          <Text style={styles.infoText}>support@acuspace.in</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: Colors.background, flexGrow: 1 },
  header: { alignItems: 'center', marginBottom: 30, marginTop: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.textPrimary, marginTop: 15, textAlign: 'center' },
  subtitle: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 22, paddingHorizontal: 10 },
  formCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 20, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 },
  label: { fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 10, fontSize: 15 },
  input: { borderWidth: 1, borderColor: '#EAEAEA', borderRadius: 12, padding: 15, fontSize: 16, backgroundColor: '#FAFAFA', minHeight: 140 },
  
  button: { backgroundColor: Colors.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  errorText: { color: '#e74c3c', marginTop: 15, textAlign: 'center', fontWeight: '600' },

  infoSection: { marginTop: 40, alignItems: 'center', paddingBottom: 40 }, 
  infoLabel: { color: Colors.textSecondary, fontSize: 13, marginBottom: 4 },
  infoText: { color: Colors.textPrimary, fontSize: 16, fontWeight: '600' },

  successContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 30,
    width: '100%',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 15,
    textAlign: 'center',
  },
  successBody: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 30,
  },
  returnBtn: {
    backgroundColor: '#EFF1ED', 
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  returnBtnText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});