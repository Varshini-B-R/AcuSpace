import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  ActivityIndicator, Switch, Platform, Modal, FlatList 
} from 'react-native';
import { Clock, Calendar, CheckCircle, X, Sun, Moon } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabase';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const generateTimeSlots = () => {
  const times = [];
  for (let h = 6; h <= 22; h++) {
    const hour = h.toString().padStart(2, '0');
    times.push(`${hour}:00`);
    times.push(`${hour}:30`);
  }
  return times;
};
const TIME_SLOTS = generateTimeSlots();

export default function ScheduleScreen() {
  const { session } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [pickerConfig, setPickerConfig] = useState<{ dayIndex: number, field: string, value: string } | null>(null);

  useEffect(() => {
    if (session?.user?.id) fetchSchedule();
  }, [session]);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('therapist_schedule')
        .select('*')
        .eq('therapist_id', session!.user.id);

      if (error) throw error;

      // Map existing data or create default blank slate
      const formattedSchedule = DAYS_OF_WEEK.map(day => {
        const existingDay = data?.find(d => d.day_of_week === day);
        
        if (existingDay) {
          return {
            ...existingDay,
            // If the database has a time, the shift is active. If it's null, it's inactive.
            morning_active: !!existingDay.morning_start,
            evening_active: !!existingDay.evening_start,
            // Provide default fallbacks just in case they toggle an empty shift ON later
            morning_start: existingDay.morning_start || '10:00',
            morning_end: existingDay.morning_end || '13:00',
            evening_start: existingDay.evening_start || '16:00',
            evening_end: existingDay.evening_end || '20:00'
          };
        }

        return {
          day_of_week: day,
          is_active: false,
          morning_active: true,
          morning_start: '10:00',
          morning_end: '13:00',
          evening_active: true,
          evening_start: '16:00',
          evening_end: '20:00'
        };
      });

      setSchedule(formattedSchedule);
    } catch (error: any) {
      alert("Error loading schedule: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDay = (index: number) => {
    const updated = [...schedule];
    updated[index].is_active = !updated[index].is_active;
    setSchedule(updated);
  };

  // NEW: Toggle individual shifts
  const handleToggleShift = (index: number, shiftType: 'morning_active' | 'evening_active') => {
    const updated = [...schedule];
    updated[index][shiftType] = !updated[index][shiftType];
    setSchedule(updated);
  };

  const handleTimeSelect = (time: string) => {
    if (!pickerConfig) return;
    const updated = [...schedule];
    updated[pickerConfig.dayIndex][pickerConfig.field] = time;
    setSchedule(updated);
    setPickerConfig(null);
  };

  const saveSchedule = async () => {
    setSaving(true);
    try {
      const payload = schedule.map(day => {
        // Validation: If a day is active, at least ONE shift must be active
        if (day.is_active && !day.morning_active && !day.evening_active) {
          throw new Error(`On ${day.day_of_week}, you must enable at least one shift, or turn the whole day off.`);
        }

        return {
          therapist_id: session!.user.id,
          day_of_week: day.day_of_week,
          is_active: day.is_active,
          // NEW: If a shift is toggled off, save NULL to the database so it's truly inactive
          morning_start: day.morning_active ? day.morning_start : null,
          morning_end: day.morning_active ? day.morning_end : null,
          evening_start: day.evening_active ? day.evening_start : null,
          evening_end: day.evening_active ? day.evening_end : null
        };
      });

      const { error } = await supabase
        .from('therapist_schedule')
        .upsert(payload, { onConflict: 'therapist_id, day_of_week' });

      if (error) throw error;
      alert("Schedule saved successfully!");

    } catch (error: any) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${m} ${ampm}`;
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Schedule</Text>
          <Text style={styles.headerSubtitle}>Manage your weekly availability</Text>
        </View>
        <TouchableOpacity style={[styles.saveBtn, saving && styles.saveBtnDisabled]} onPress={saveSchedule} disabled={saving}>
          {saving ? <ActivityIndicator color="#FFF" size="small" /> : (
            <><CheckCircle size={18} color="#FFF" /><Text style={styles.saveBtnText}>Save</Text></>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {schedule.map((day, index) => (
          <View key={day.day_of_week} style={[styles.dayCard, !day.is_active && styles.dayCardInactive]}>
            
            <View style={styles.dayHeader}>
              <View style={styles.dayTitleRow}>
                <Calendar size={20} color={day.is_active ? Colors.primary : Colors.textSecondary} />
                <Text style={[styles.dayText, !day.is_active && styles.textInactive]}>{day.day_of_week}</Text>
              </View>
              <Switch
                value={day.is_active}
                onValueChange={() => handleToggleDay(index)}
                trackColor={{ false: '#EAEAEA', true: '#D1E0C9' }}
                thumbColor={day.is_active ? Colors.primary : '#9CA3AF'}
              />
            </View>

            {/* Time Blocks */}
            {day.is_active && (
              <View style={styles.shiftsContainer}>
                
                {/* Morning Shift */}
                <View style={[styles.shiftRow, !day.morning_active && styles.shiftRowInactive]}>
                  <View style={styles.shiftLabelContainer}>
                    {/* NEW: Shift Toggle */}
                    <Switch
                      value={day.morning_active}
                      onValueChange={() => handleToggleShift(index, 'morning_active')}
                      trackColor={{ false: '#EAEAEA', true: '#D1E0C9' }}
                      thumbColor={day.morning_active ? Colors.primary : '#9CA3AF'}
                      style={Platform.OS === 'web' ? { transform: [{ scale: 0.8 }] } : { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                    />
                    <Sun size={16} color={day.morning_active ? "#F59E0B" : Colors.textSecondary} />
                    <Text style={[styles.shiftLabel, !day.morning_active && styles.textInactive]}>Morning</Text>
                  </View>
                  
                  {day.morning_active ? (
                    <View style={styles.timePickers}>
                      <TouchableOpacity style={styles.timeBtn} onPress={() => setPickerConfig({ dayIndex: index, field: 'morning_start', value: day.morning_start })}>
                        <Text style={styles.timeBtnText}>{formatTime(day.morning_start)}</Text>
                      </TouchableOpacity>
                      <Text style={styles.toText}>to</Text>
                      <TouchableOpacity style={styles.timeBtn} onPress={() => setPickerConfig({ dayIndex: index, field: 'morning_end', value: day.morning_end })}>
                        <Text style={styles.timeBtnText}>{formatTime(day.morning_end)}</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <Text style={styles.offText}>Shift Disabled</Text>
                  )}
                </View>

                <View style={styles.divider} />

                {/* Evening Shift */}
                <View style={[styles.shiftRow, !day.evening_active && styles.shiftRowInactive]}>
                  <View style={styles.shiftLabelContainer}>
                     {/* NEW: Shift Toggle */}
                     <Switch
                      value={day.evening_active}
                      onValueChange={() => handleToggleShift(index, 'evening_active')}
                      trackColor={{ false: '#EAEAEA', true: '#D1E0C9' }}
                      thumbColor={day.evening_active ? Colors.primary : '#9CA3AF'}
                      style={Platform.OS === 'web' ? { transform: [{ scale: 0.8 }] } : { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                    />
                    <Moon size={16} color={day.evening_active ? "#6366F1" : Colors.textSecondary} />
                    <Text style={[styles.shiftLabel, !day.evening_active && styles.textInactive]}>Evening</Text>
                  </View>

                  {day.evening_active ? (
                    <View style={styles.timePickers}>
                      <TouchableOpacity style={styles.timeBtn} onPress={() => setPickerConfig({ dayIndex: index, field: 'evening_start', value: day.evening_start })}>
                        <Text style={styles.timeBtnText}>{formatTime(day.evening_start)}</Text>
                      </TouchableOpacity>
                      <Text style={styles.toText}>to</Text>
                      <TouchableOpacity style={styles.timeBtn} onPress={() => setPickerConfig({ dayIndex: index, field: 'evening_end', value: day.evening_end })}>
                        <Text style={styles.timeBtnText}>{formatTime(day.evening_end)}</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <Text style={styles.offText}>Shift Disabled</Text>
                  )}
                </View>

              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* TIME PICKER MODAL */}
      <Modal visible={!!pickerConfig} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Time</Text>
              <TouchableOpacity onPress={() => setPickerConfig(null)} style={styles.closeBtn}>
                <X size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={TIME_SLOTS}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity style={[styles.timeSlotBtn, pickerConfig?.value === item && styles.timeSlotBtnActive]} onPress={() => handleTimeSelect(item)}>
                  <Text style={[styles.timeSlotText, pickerConfig?.value === item && styles.timeSlotTextActive]}>{formatTime(item)}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: '#EAEAEA' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.textPrimary },
  headerSubtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  
  saveBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, gap: 8 },
  saveBtnDisabled: { backgroundColor: '#9CA3AF' },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },

  scrollContent: { padding: 20, paddingBottom: 40, maxWidth: 800, alignSelf: 'center', width: '100%' },

  dayCard: { backgroundColor: Colors.surface, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#EAEAEA', overflow: 'hidden', ...Platform.select({ web: { boxShadow: '0 4px 6px rgba(0,0,0,0.02)' } }) },
  dayCardInactive: { backgroundColor: '#FAFAF5', borderColor: '#F0F0F0' },
  
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  dayTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dayText: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary },
  textInactive: { color: Colors.textSecondary },

  shiftsContainer: { padding: 16, paddingTop: 0, backgroundColor: Colors.surface },
  shiftRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginTop: 12 },
  shiftRowInactive: { opacity: 0.6 },
  shiftLabelContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, minWidth: 150 },
  shiftLabel: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  offText: { fontSize: 14, color: Colors.textSecondary, fontStyle: 'italic', paddingRight: 10 },
  
  timePickers: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timeBtn: { backgroundColor: '#F3F4F6', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  timeBtnText: { fontSize: 15, fontWeight: '500', color: Colors.textPrimary },
  toText: { color: Colors.textSecondary, fontSize: 14, fontStyle: 'italic' },
  
  divider: { height: 1, backgroundColor: '#F0F0F0', my: 16 },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: Colors.surface, borderRadius: 24, padding: 24, width: '100%', maxWidth: 400, alignSelf: 'center', maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.textPrimary },
  closeBtn: { padding: 4 },
  
  timeSlotBtn: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', alignItems: 'center' },
  timeSlotBtnActive: { backgroundColor: '#EBF0E6', borderRadius: 8, borderBottomWidth: 0 },
  timeSlotText: { fontSize: 16, color: Colors.textPrimary },
  timeSlotTextActive: { fontWeight: 'bold', color: Colors.primary },
});