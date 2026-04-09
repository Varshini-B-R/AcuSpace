import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, KeyRound, Lock, Mail, User } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Colors } from '../constants/Colors';
import { supabase } from '../lib/supabase';

// NEW: Expanded view modes for the OTP flow
type ViewMode = 'signIn' | 'signUp' | 'forgotPassword' | 'verifyOtp' | 'setNewPassword';

const showPlatformAlert = (title: string, message: string, isConfirm = false, onConfirm?: () => void) => {
  if (Platform.OS === 'web') {
    if (isConfirm) {
      const result = window.confirm(`${title}\n\n${message}`);
      if (result && onConfirm) onConfirm();
    } else {
      window.alert(`${title}\n\n${message}`);
    }
  } else {
    if (isConfirm) {
      Alert.alert(title, message, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: onConfirm }
      ]);
    } else {
      Alert.alert(title, message);
    }
  }
};

export default function LoginScreen() {
  const router = useRouter();

  const [viewMode, setViewMode] = useState<ViewMode>('signIn');
  const [loading, setLoading] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // NEW: OTP State
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  async function handleAuthentication() {
    setLoading(true);

    try {
      // --- 1. FORGOT PASSWORD (Send OTP) ---
      if (viewMode === 'forgotPassword') {
        if (!email) throw new Error('Please enter your email address.');
        const cleanEmail = email.trim();
        
        const { data: emailExists, error: checkError } = await supabase.rpc('check_email_exists', { lookup_email: cleanEmail });
        if (checkError) throw checkError;

        if (!emailExists) {
          showPlatformAlert('Account Not Found', "We couldn't find an account with that email. Click OK to Sign Up.", true, () => setViewMode('signUp'));
          setLoading(false);
          return;
        }

        const { error: resetError } = await supabase.auth.resetPasswordForEmail(cleanEmail);
        if (resetError) throw resetError;
        
        showPlatformAlert('Code Sent', 'Check your inbox for the 8-digit reset code.');
        setViewMode('verifyOtp'); // Move to Step 2
      } 
      
      // --- 2. VERIFY OTP ---
      else if (viewMode === 'verifyOtp') {
        if (!otp || otp.length < 8) throw new Error('Please enter the 8-digit code.');
        
        const { error: verifyError } = await supabase.auth.verifyOtp({
          email: email.trim(),
          token: otp.trim(),
          type: 'recovery' // Crucial: tells Supabase this is a password reset OTP
        });

        if (verifyError) throw verifyError;
        
        // If successful, Supabase grants a secure session. Now we ask for a new password.
        setViewMode('setNewPassword'); 
      }

      // --- 3. SET NEW PASSWORD ---
      else if (viewMode === 'setNewPassword') {
        if (!newPassword || newPassword.length < 6) throw new Error('Password must be at least 6 characters.');

        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword
        });

        if (updateError) throw updateError;
        
        showPlatformAlert('Success', 'Your password has been updated!');
        router.replace('/(drawer)'); // Log them directly into the app!
      }
      
      // --- SIGN UP FLOW ---
      else if (viewMode === 'signUp') {
        if (!password || !name || !email) throw new Error('Please fill in all fields.');

        const { data, error } = await supabase.auth.signUp({ 
          email: email.trim(), password, options: { data: { full_name: name.trim() } }
        });

        if (error) throw error;
        if (data.user) router.replace('/(drawer)');
      } 
      
      // --- SIGN IN FLOW ---
      else {
        if (!email || !password) throw new Error('Please enter your email and password.');

        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        
        router.replace('/(drawer)');
      }
    } catch (error: any) {
      showPlatformAlert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }

  // --- UI RENDERING ---
  const renderHeader = () => {
    switch (viewMode) {
      case 'forgotPassword':
        return <><Text style={styles.title}>Reset Password</Text><Text style={styles.subtitle}>Enter your email address to receive an 8-digit reset code.</Text></>;
      case 'verifyOtp':
        return <><Text style={styles.title}>Enter Code</Text><Text style={styles.subtitle}>We sent an 8-digit code to {email}.</Text></>;
      case 'setNewPassword':
        return <><Text style={styles.title}>New Password</Text><Text style={styles.subtitle}>Create a new secure password for your account.</Text></>;
      case 'signUp':
        return <><Text style={styles.title}>Create an Account</Text><Text style={styles.subtitle}>Sign up to start booking your holistic sessions.</Text></>;
      default:
        return <><Text style={styles.title}>Welcome to AcuSpace</Text><Text style={styles.subtitle}>Sign in to manage your appointments.</Text></>;
    }
  };

  const renderButtonText = () => {
    switch (viewMode) {
      case 'forgotPassword': return 'Send Code';
      case 'verifyOtp': return 'Verify Code';
      case 'setNewPassword': return 'Update Password';
      case 'signUp': return 'Create Account';
      default: return 'Sign In';
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ headerShown: false }} /> 

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          
          {(viewMode === 'forgotPassword' || viewMode === 'verifyOtp') && (
            <TouchableOpacity style={styles.backButton} onPress={() => setViewMode('signIn')}>
              <ArrowLeft color={Colors.textSecondary} size={24} />
            </TouchableOpacity>
          )}

          {renderHeader()}

          {/* NAME INPUT */}
          {viewMode === 'signUp' && (
            <View style={styles.inputContainer}>
              <User color={Colors.textSecondary} size={20} style={styles.icon} />
              <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor={Colors.textSecondary} value={name} onChangeText={setName} autoCapitalize="words" />
            </View>
          )}

          {/* EMAIL INPUT (Hidden during OTP entry and Password reset) */}
          {(viewMode === 'signIn' || viewMode === 'signUp' || viewMode === 'forgotPassword') && (
            <View style={styles.inputContainer}>
              <Mail color={Colors.textSecondary} size={20} style={styles.icon} />
              <TextInput style={styles.input} placeholder="Email address" placeholderTextColor={Colors.textSecondary} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
            </View>
          )}

          {/* OTP INPUT */}
          {viewMode === 'verifyOtp' && (
            <View style={styles.inputContainer}>
              <KeyRound color={Colors.textSecondary} size={20} style={styles.icon} />
              <TextInput 
                style={styles.input} 
                placeholder="8-Digit Code" 
                placeholderTextColor={Colors.textSecondary} 
                value={otp} 
                onChangeText={setOtp} 
                keyboardType="number-pad" 
                maxLength={8} // <-- Changed from 6 to 8
              />
            </View>
          )}

          {/* PASSWORD INPUT (Hidden during Forgot Password and Verify OTP) */}
          {(viewMode === 'signIn' || viewMode === 'signUp') && (
            <View style={styles.inputContainer}>
              <Lock color={Colors.textSecondary} size={20} style={styles.icon} />
              <TextInput style={styles.input} placeholder="Password" placeholderTextColor={Colors.textSecondary} value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" />
            </View>
          )}

          {/* NEW PASSWORD INPUT */}
          {viewMode === 'setNewPassword' && (
            <View style={styles.inputContainer}>
              <Lock color={Colors.textSecondary} size={20} style={styles.icon} />
              <TextInput style={styles.input} placeholder="New Secure Password" placeholderTextColor={Colors.textSecondary} value={newPassword} onChangeText={setNewPassword} secureTextEntry autoCapitalize="none" />
            </View>
          )}

          {loading ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 24 }} />
          ) : (
            <View style={styles.actionContainer}>
              <TouchableOpacity style={styles.primaryButton} onPress={handleAuthentication} activeOpacity={0.8}>
                <Text style={styles.primaryButtonText}>{renderButtonText()}</Text>
              </TouchableOpacity>
              
              {viewMode === 'signIn' && (
                <View style={styles.secondaryActions}>
                  <TouchableOpacity onPress={() => setViewMode('forgotPassword')} style={{ paddingVertical: 8 }}>
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setViewMode('signUp')} style={{ paddingVertical: 8 }}>
                    <Text style={styles.toggleText}>Don't have an account? Sign Up</Text>
                  </TouchableOpacity>
                </View>
              )}

              {viewMode === 'signUp' && (
                <TouchableOpacity style={styles.toggleButton} onPress={() => setViewMode('signIn')}>
                  <Text style={styles.toggleText}>Already have an account? Sign In</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 450, backgroundColor: Colors.surface, padding: 32, borderRadius: 24, borderWidth: 1, borderColor: '#EAEAEA', ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 24 }, android: { elevation: 4 }, web: { boxShadow: '0px 12px 32px rgba(0, 0, 0, 0.06)' } }) },
  backButton: { position: 'absolute', top: 24, left: 24, zIndex: 10, padding: 8, marginLeft: -8 },
  title: { fontSize: 28, fontWeight: 'bold', color: Colors.textPrimary, textAlign: 'center', marginBottom: 12 },
  subtitle: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center', marginBottom: 32, lineHeight: 24 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, marginBottom: 16, paddingHorizontal: 16, height: 60 },
  icon: { marginRight: 12 },
  input: { flex: 1, height: '100%', fontSize: 16, color: Colors.textPrimary, ...(Platform.OS === 'web' && { outlineStyle: 'none' } as any) },
  actionContainer: { marginTop: 8, gap: 16 },
  primaryButton: { width: '100%', height: 60, backgroundColor: Colors.primary, borderRadius: 12, justifyContent: 'center', alignItems: 'center', ...(Platform.OS === 'web' && { cursor: 'pointer' } as any) },
  primaryButtonText: { color: Colors.surface, fontSize: 18, fontWeight: '700' },
  secondaryActions: { alignItems: 'center', gap: 4, marginTop: 8 },
  forgotPasswordText: { color: Colors.primary, fontSize: 15, fontWeight: '600' },
  toggleButton: { alignItems: 'center', paddingVertical: 12 },
  toggleText: { color: Colors.textSecondary, fontSize: 15, fontWeight: '600' },
});