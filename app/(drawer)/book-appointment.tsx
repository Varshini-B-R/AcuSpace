import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { Calendar, CalendarClock, CheckCircle } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  createElement,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { Colors } from '../../constants/Colors';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabase';

// Helper to format 24h (14:30) to 12h (2:30 PM) for the UI buttons
const formatTimeToAMPM = (timeString: string) => {
  const [hourString, minute] = timeString.split(':');
  let hour = parseInt(hourString, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12; 
  return `${hour.toString().padStart(2, '0')}:${minute} ${ampm}`;
};

// Helper to format AM/PM back to Database ISO Timestamp
const convertToISOTimestamp = (dateStr: string, time12h: string) => {
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');
  
  if (hours === '12') hours = '00';
  if (modifier === 'PM') hours = (parseInt(hours, 10) + 12).toString();
  
  const dateTimeString = `${dateStr}T${hours.padStart(2, '0')}:${minutes}:00`;
  return new Date(dateTimeString).toISOString();
};

// --- NEW: Helper to chop shifts into 30-minute blocks ---
const generateTimeSlots = (start: string, end: string) => {
  if (!start || !end) return [];
  const slots = [];
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);

  let currentMins = startH * 60 + startM;
  const endMins = endH * 60 + endM;

  while (currentMins < endMins) {
    const h = Math.floor(currentMins / 60);
    const m = currentMins % 60;
    const time24 = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    slots.push(time24);
    currentMins += 30; // Jump 30 minutes
  }
  return slots; 
};

export default function BookAppointmentScreen() {
  const params = useLocalSearchParams();
  const therapistId = params.therapistId as string; 
  const { session } = useAuth();
  
  const todayFormatted = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayFormatted); 
  const [dateObj, setDateObj] = useState(new Date()); 
  const [showPicker, setShowPicker] = useState(false); 

  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState({ name: '', phone: '', slot: '' });

  const handleNativeDateChange = (event: any, selected?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (selected) {
      setDateObj(selected);
      const formatted = selected.toISOString().split('T')[0];
      setSelectedDate(formatted);
      setSelectedSlot(null); 
    }
  };


  const fetchAvailableSlots = async (id: string, date: string) => {
    if (!id) return; 
    setLoadingSlots(true);
    
    console.log("--- Fetching Slots ---");
    console.log("Therapist ID:", id);
    console.log("Selected Date:", date);

    try {
      // 1. Figure out the exact day of the week safely using local time
      const [year, month, day] = date.split('-').map(Number);
      const localDateObj = new Date(year, month - 1, day);
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayOfWeek = days[localDateObj.getDay()];
      
      console.log("Calculated Day of Week:", dayOfWeek);

      // 2. Fetch the therapist's custom rules for this day
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('therapist_schedule')
        .select('*')
        .eq('therapist_id', id)
        .eq('day_of_week', dayOfWeek)
        .single();

      if (scheduleError && scheduleError.code !== 'PGRST116') {
         console.error("Supabase Error fetching schedule:", scheduleError);
         throw scheduleError;
      }

      console.log("Schedule Data from DB:", scheduleData);

      // If no schedule, or day is explicitly toggled OFF by therapist
      if (!scheduleData || !scheduleData.is_active) {
        console.log("No active schedule found for this day.");
        setAvailableSlots([]);
        return;
      }

      // ... rest of the function


      // 3. Generate raw 24h slots based on their shift preferences
      let rawSlots: string[] = [];
      if (scheduleData.morning_start && scheduleData.morning_end) {
        rawSlots = [...rawSlots, ...generateTimeSlots(scheduleData.morning_start, scheduleData.morning_end)];
      }
      if (scheduleData.evening_start && scheduleData.evening_end) {
        rawSlots = [...rawSlots, ...generateTimeSlots(scheduleData.evening_start, scheduleData.evening_end)];
      }

      // 4. Fetch already booked appointments to prevent double-booking
      const startOfDay = new Date(year, month - 1, day, 0, 0, 0).toISOString();
      const endOfDay = new Date(year, month - 1, day, 23, 59, 59).toISOString();

      const { data: bookedData, error: bookedError } = await supabase
        .from('appointments')
        .select('scheduled_at')
        .eq('therapist_id', id)
        .neq('status', 'cancelled') // Cancelled slots are open!
        .gte('scheduled_at', startOfDay)
        .lte('scheduled_at', endOfDay);

      if (bookedError) throw bookedError;

      // Convert booked ISO timestamps back to local 'HH:mm' string to match our generated slots
      const bookedTimes = bookedData.map(appt => {
        const d = new Date(appt.scheduled_at);
        return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      });

      // 5. Filter the raw slots
      const now = new Date();
      const isToday = localDateObj.toDateString() === now.toDateString();

      const validSlots = rawSlots.filter(slot24 => {
        // Remove if someone already booked it
        if (bookedTimes.includes(slot24)) return false;

        // Remove if it's today and the time has already passed (needs 10 min buffer)
        if (isToday) {
          const [hours, minutes] = slot24.split(':').map(Number);
          const slotTimeObj = new Date();
          slotTimeObj.setHours(hours, minutes, 0, 0);
          const diffInMinutes = (slotTimeObj.getTime() - now.getTime()) / (1000 * 60);
          if (diffInMinutes < 10) return false; 
        }

        return true;
      });

      // 6. Format back to standard AM/PM UI format
      const finalUISlots = validSlots.map(slot => formatTimeToAMPM(slot));
      setAvailableSlots(finalUISlots); 

    } catch (error: any) {
      console.error('Error fetching slots:', error.message);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    if (therapistId && selectedDate) {
      fetchAvailableSlots(therapistId, selectedDate);
    }
  }, [therapistId, selectedDate]);

  
  const handleBooking = async () => {
    setErrors({ name: '', phone: '', slot: '' });
    let isValid = true;
    let newErrors = { name: '', phone: '', slot: '' };
  
    if (!selectedSlot) { newErrors.slot = 'Please select a time.'; isValid = false; }
    if (name.trim().length < 2) { newErrors.name = 'Please enter your name.'; isValid = false; }
    if (!/^[6-9]\d{9}$/.test(phone)) { newErrors.phone = 'Invalid mobile number.'; isValid = false; }
  
    if (!isValid) {
      setErrors(newErrors);
      return;
    }
  
    if (!session?.user?.id) {
      Alert.alert("Authentication Error", "You must be logged in to book an appointment.");
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      const scheduledAtTimestamp = convertToISOTimestamp(selectedDate, selectedSlot);
  
      await supabase
        .from('profiles')
        .update({ full_name: name.trim(), phone: phone.trim() })
        .eq('id', session.user.id);
  
      const { error } = await supabase
        .from('appointments')
        .insert({
          patient_id: session.user.id,
          therapist_id: therapistId,
          scheduled_at: scheduledAtTimestamp,
          status: 'pending',
          symptoms: reason || null,
        });
  
      if (error) {
        if (error.code === '23505') {
          Alert.alert("Slot Taken", "This time slot was just booked.");
          fetchAvailableSlots(therapistId, selectedDate);
        }
        setIsSubmitting(false); 
        return;
      }
  
      setBookingSuccess(true); 
  
    } catch (err: any) {
      Alert.alert("Booking Failed", err.message);
      setIsSubmitting(false);
    }
  };


  if (bookingSuccess) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <View style={[styles.card, { alignItems: 'center', padding: 32, maxWidth: 400, width: '100%' }]}>
          <CalendarClock size={64} color={Colors.primary} style={{ marginBottom: 16 }} />
          <Text style={[styles.title, { textAlign: 'center', fontSize: 24, marginBottom: 12 }]}>
            Appointment Requested
          </Text>
          <Text style={[styles.subtitle, { textAlign: 'center', marginBottom: 24, lineHeight: 22 }]}>
            Thank you! Your request has been sent to the therapist. You will see their response in your profile shortly.
          </Text>
          <TouchableOpacity 
            style={[styles.submitButton, { width: '100%', marginBottom: 0 }]} 
            onPress={() => router.replace('/profile')}
          >
            <Text style={styles.submitButtonText}>View My Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isSubmitting) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <View style={[styles.card, { alignItems: 'center', padding: 32, maxWidth: 400 }]}>
          
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginBottom: 20 }} />
  
          <Text style={[styles.title, { textAlign: 'center', fontSize: 22 }]}>
            Request Sent!
          </Text>
  
          <Text style={[styles.subtitle, { textAlign: 'center', marginTop: 10, lineHeight: 22 }]}>
            Please wait while the therapist reviews your appointment request.
            You will be notified once it is approved or declined.
          </Text>
  
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentWrapper}>
          
          <View style={styles.pageHeader}>
            <Text style={styles.title}>Consultation Details</Text>
            <Text style={styles.subtitle}>Select a date and time that works for you</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Select Date</Text>
            
            {Platform.OS === 'web' ? (
              createElement('input', {
                type: 'date',
                value: selectedDate,
                min: todayFormatted,
                onChange: (e: any) => {
                  setSelectedDate(e.target.value);
                  setSelectedSlot(null);
                },
                style: styles.webDatePicker
              })
            ) : (
              <>
                <TouchableOpacity style={styles.dateSelectorBtn} onPress={() => setShowPicker(true)}>
                  <Calendar size={20} color={Colors.primary} />
                  <Text style={styles.dateSelectorText}>
                    {dateObj.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </Text>
                </TouchableOpacity>

                {showPicker && (
                  <DateTimePicker
                    value={dateObj}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleNativeDateChange}
                    minimumDate={new Date()} 
                  />
                )}
              </>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Available Slots for {selectedDate}</Text>
            {loadingSlots ? (
              <ActivityIndicator size="large" color={Colors.primary} style={{ marginVertical: 20 }} />
            ) : availableSlots.length === 0 ? (
              <Text style={{ color: Colors.textSecondary, fontStyle: 'italic', marginVertical: 10 }}>
                No slots available for this date.
              </Text>
            ) : (
              <View style={styles.slotGrid}>
                {availableSlots.map((slot) => (
                  <TouchableOpacity
                    key={slot}
                    style={[styles.slotButton, selectedSlot === slot && styles.slotButtonSelected]}
                    onPress={() => {
                      setSelectedSlot(slot);
                      if (errors.slot) setErrors({ ...errors, slot: '' });
                    }}
                  >
                    <Text style={[styles.slotText, selectedSlot === slot && styles.slotTextSelected]}>{slot}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {errors.slot ? <Text style={styles.errorText}>{errors.slot}</Text> : null}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Patient Details</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={[styles.input, errors.name ? styles.inputError : null]}
                placeholder="E.g., John Doe"
                placeholderTextColor={Colors.textSecondary}
                value={name}
                onChangeText={(text) => { setName(text); if (errors.name) setErrors({ ...errors, name: '' }); }}
              />
              {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mobile Number</Text>
              <TextInput
                style={[styles.input, errors.phone ? styles.inputError : null]}
                placeholder="9876543210"
                placeholderTextColor={Colors.textSecondary}
                keyboardType="numeric"
                maxLength={10}
                value={phone}
                onChangeText={(text) => { setPhone(text.replace(/[^0-9]/g, '')); if (errors.phone) setErrors({ ...errors, phone: '' }); }}
              />
              {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Reason for Visit (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="E.g., Back pain, general wellness..."
                placeholderTextColor={Colors.textSecondary}
                multiline
                numberOfLines={3}
                value={reason}
                onChangeText={setReason}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleBooking}>
            <Text style={styles.submitButtonText}>Confirm Appointment</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { flexGrow: 1, alignItems: 'center', paddingVertical: 24, paddingHorizontal: 16 },
  contentWrapper: { width: '100%', maxWidth: 600 },
  pageHeader: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8 },
  subtitle: { fontSize: 16, color: Colors.textSecondary },
  card: {
    backgroundColor: Colors.surface, borderRadius: 12, padding: 20, marginBottom: 20,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 3 },
      web: { boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)' }
    }),
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary, marginBottom: 16 },
  
  dateSelectorBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background,
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 14,
  },
  dateSelectorText: { fontSize: 16, color: Colors.textPrimary, marginLeft: 10, fontWeight: '500' },
  webDatePicker: {
    padding: '12px 16px', borderRadius: '8px', border: '1px solid #E5E7EB',
    fontSize: '16px', color: '#2C3E50', backgroundColor: '#FAFAF5', fontFamily: 'inherit',
    outline: 'none', cursor: 'pointer', width: '100%',
  },
  
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  slotButton: {
    width: '30%', minWidth: 90, flexGrow: 1, margin: 6, paddingVertical: 12,
    borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: Colors.surface, alignItems: 'center',
  },
  slotButtonSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  slotText: { fontSize: 14, fontWeight: '500', color: Colors.textPrimary },
  slotTextSelected: { color: Colors.surface },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: Colors.textPrimary, marginBottom: 8 },
  input: {
    backgroundColor: Colors.background, borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: Colors.textPrimary,
  },
  inputError: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 6, marginLeft: 4 },
  submitButton: { backgroundColor: Colors.primary, borderRadius: 8, paddingVertical: 16, alignItems: 'center', marginTop: 8, marginBottom: 32 },
  submitButtonText: { color: Colors.surface, fontSize: 16, fontWeight: '600' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: Colors.surface,
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 },
      android: { elevation: 10 },
      web: { boxShadow: '0px 20px 40px rgba(0, 0, 0, 0.1)' }
    }),
  },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 12, textAlign: 'center' },
  modalText: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center', marginBottom: 28, lineHeight: 24 },
  modalButton: { backgroundColor: Colors.primary, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12, width: '100%', alignItems: 'center' },
  modalButtonText: { color: Colors.surface, fontSize: 16, fontWeight: 'bold' },
});