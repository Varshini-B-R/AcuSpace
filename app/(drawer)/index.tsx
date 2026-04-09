import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AnimatedView from '../../components/AnimatedView';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabase';
import { getDailyContent } from '../../utils/dailyContent';

// --- Web-Safe SVG Icons ---
import { Book, CheckCircle, ChevronRight, Clock, FileText, Heart, Network, Phone, Search, ShoppingCart, Sparkles, User, Users, Video, XCircle } from 'lucide-react-native';

const { width } = Dimensions.get('window');

let hasSeenWelcome = false;

export default function HomeScreen() {
  const router = useRouter();
  const { session, userRole } = useAuth();
  const { dailyPoint, dailyFact } = useMemo(() => getDailyContent(), []);
  
  const [showWelcome, setShowWelcome] = useState(!hasSeenWelcome);
  
  // --- Therapist State ---
  const [loadingTherapistData, setLoadingTherapistData] = useState(true);
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [therapistName, setTherapistName] = useState('');

  useEffect(() => {
    if (showWelcome) {
      const timer = setTimeout(() => {
        setShowWelcome(false);
        hasSeenWelcome = true; 
      }, 3000); 
      return () => clearTimeout(timer); 
    }
  }, [showWelcome]);

  // --- Fetch Therapist Data if applicable ---
  useEffect(() => {
    if (userRole === 'therapist' && session?.user?.id) {
      fetchTherapistData();
    } else {
      setLoadingTherapistData(false);
    }
  }, [userRole, session]);

  const fetchTherapistData = async () => {
    try {
      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', session!.user.id).single();
      if (profile) setTherapistName(profile.full_name || 'Doctor');

      const { data: appts, error } = await supabase
        .from('appointments')
        .select(`id, scheduled_at, status, symptoms, intake_completed, intake_data, patient:profiles!appointments_patient_id_fkey(full_name, phone)`)
        .eq('therapist_id', session!.user.id)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;

      if (appts) {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const endOfToday = startOfToday + 86400000;

        setPendingRequests(appts.filter(a => a.status === 'pending' && new Date(a.scheduled_at).getTime() >= now.getTime()));
        setTodayAppointments(appts.filter(a => 
          a.status === 'confirmed' && 
          new Date(a.scheduled_at).getTime() >= startOfToday &&
          new Date(a.scheduled_at).getTime() < endOfToday
        ));
      }
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoadingTherapistData(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: 'confirmed' | 'cancelled') => {
    const apptToMove = pendingRequests.find(a => a.id === appointmentId);
    if (apptToMove) {
      setPendingRequests(prev => prev.filter(a => a.id !== appointmentId));
      if (newStatus === 'confirmed') {
        const isToday = new Date(apptToMove.scheduled_at).toDateString() === new Date().toDateString();
        if (isToday) {
          setTodayAppointments(prev => [...prev, { ...apptToMove, status: 'confirmed' }].sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()));
        }
      }
    }

    try {
      await supabase.from('appointments').update({ status: newStatus }).eq('id', appointmentId);
    } catch (error: any) {
      fetchTherapistData(); 
      alert(error.message);
    }
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };


  const isWeb = Platform.OS === 'web';
  const cardWidth = isWeb ? 300 : (width - 55) / 2;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      
      {/* --- HEADER --- */}
        {showWelcome && (
          <AnimatedView>
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>Welcome back to</Text>
                <Text style={styles.username}>AcuSpace</Text>
              </View>
            </View>
          </AnimatedView>
        )}

        {/* --- THERAPIST ONLY: Welcome Block --- */}
        {userRole === 'therapist' && !loadingTherapistData && (
          <AnimatedView delay={50}>
            <View style={styles.therapistWelcomeBlock}>
               <Text style={styles.greeting}>Hello,</Text>
               <Text style={styles.username}>Dr. {therapistName}</Text>
            </View>
          </AnimatedView>
        )}

        {/* --- PATIENT ONLY: SEARCH BAR --- */}
        {userRole !== 'therapist' && (
          <AnimatedView delay={50}>
            <TouchableOpacity 
              style={styles.homeSearchContainer} 
              onPress={() => router.push('/(drawer)/symptoms')}
              activeOpacity={0.8}
            >
              <Search size={20} color={Colors.textSecondary} style={styles.searchIcon} />
              <Text style={styles.searchPlaceholder}>Search symptoms...</Text>
            </TouchableOpacity>
          </AnimatedView>
        )}

        {/* --- UNIVERSAL: POINT OF THE DAY --- */}
        <AnimatedView delay={100}>
          <Text style={styles.sectionTitle}>✨ Point of the Day</Text>
          <TouchableOpacity 
            style={styles.dailyCard} 
            onPress={() => router.push(`/meridian/point/${dailyPoint.code}?source=home`)}
            activeOpacity={0.9}
          >
            <View style={styles.dailyContent}>
              <View style={styles.dailyBadge}>
                <Text style={styles.dailyCode}>{dailyPoint.code}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.dailyName}>{dailyPoint.name}</Text>
                <Text style={styles.dailyBenefit} numberOfLines={1}>
                  {dailyPoint.benefits[0]}
                </Text>
              </View>
              <ChevronRight size={24} color="#FFF" />
            </View>
            <Sparkles size={80} color="rgba(255,255,255,0.15)" style={styles.bgIcon} />
          </TouchableOpacity>
        </AnimatedView>

        {/* ========================================== */}
        {/* THERAPIST SECTION: COMMAND CENTER          */}
        {/* ========================================== */}
        {userRole === 'therapist' && (
          <AnimatedView delay={150}>
            {loadingTherapistData ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <>
                {/* Stats Row */}
                <View style={styles.statsRow}>
                  <View style={styles.statCard}>
                    <Clock size={24} color={Colors.primary} />
                    <Text style={styles.statNumber}>{todayAppointments.length}</Text>
                    <Text style={styles.statLabel}>Today's Sessions</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Users size={24} color="#F59E0B" />
                    <Text style={styles.statNumber}>{pendingRequests.length}</Text>
                    <Text style={styles.statLabel}>Pending Requests</Text>
                  </View>
                </View>

                {/* Today's Agenda */}
                <Text style={styles.sectionTitle}>📅 Today's Agenda</Text>
                {todayAppointments.length === 0 ? (
                  <View style={styles.emptyCard}><Text style={styles.emptyText}>No appointments scheduled for today.</Text></View>
                ) : (
                  todayAppointments.map((appt) => (
                    <View key={appt.id} style={styles.agendaCard}>
                      <View style={styles.timeBlock}><Text style={styles.timeText}>{formatTime(appt.scheduled_at)}</Text></View>
                      <View style={styles.agendaDetails}>
                        <Text style={styles.patientName}>{appt.patient?.full_name || 'Unknown Patient'}</Text>
                        {appt.symptoms && <Text style={styles.patientNotes} numberOfLines={1}>Booking Note: {appt.symptoms}</Text>}
                        
                        {/* NEW: The Patient Intake Display Box */}
                        {appt.intake_completed && appt.intake_data && (
                          <View style={styles.intakeBox}>
                            <Text style={styles.intakeBadge}>Intake Completed</Text>
                            
                            <Text style={styles.intakeLabel}>Primary Complaint:</Text>
                            <Text style={styles.intakeValue}>{appt.intake_data.main_complaint}</Text>
                            
                            {appt.intake_data.duration ? (
                              <Text style={styles.intakeValue}><Text style={styles.intakeLabel}>Duration: </Text>{appt.intake_data.duration}</Text>
                            ) : null}
                            
                            {appt.intake_data.tongue_pulse_notes ? (
                              <View style={{ marginTop: 4 }}>
                                <Text style={styles.intakeLabel}>TCM Observations:</Text>
                                <Text style={styles.intakeValue}>{appt.intake_data.tongue_pulse_notes}</Text>
                              </View>
                            ) : null}
                          </View>
                        )}
  
                        {/* The Video Call Button */}
                        <TouchableOpacity 
                          style={styles.videoButton}
                          onPress={() => {
                            const roomUrl = `https://meet.jit.si/AcuSpace-Consultation-${appt.id}`;
                            Linking.openURL(roomUrl);
                          }}
                        >
                          <Video size={16} color="#FFF" />
                          <Text style={styles.videoButtonText}>Start Video Session</Text>
                        </TouchableOpacity>
  
                      </View>
                    </View>
                  ))
                )}

                {/* Action Required */}
                {pendingRequests.length > 0 && (
                  <>
                    <Text style={[styles.sectionTitle, { marginTop: 24 }]}>🚨 Action Required ({pendingRequests.length})</Text>
                    {pendingRequests.map((appt) => (
                      <View key={appt.id} style={styles.requestCard}>
                        <View style={styles.requestHeader}>
                          <Text style={styles.requestDate}>{new Date(appt.scheduled_at).toLocaleDateString()} at {formatTime(appt.scheduled_at)}</Text>
                        </View>
                        <View style={styles.requestBody}>
                          <View style={styles.infoRow}><User size={16} color={Colors.textSecondary} /><Text style={styles.infoText}>{appt.patient?.full_name || 'New Patient'}</Text></View>
                          <View style={styles.infoRow}><Phone size={16} color={Colors.textSecondary} /><Text style={styles.infoText}>{appt.patient?.phone || 'No phone'}</Text></View>
                          {appt.symptoms && <View style={[styles.infoRow, { alignItems: 'flex-start' }]}><FileText size={16} color={Colors.textSecondary} style={{ marginTop: 2 }} /><Text style={styles.infoText}>{appt.symptoms}</Text></View>}
                        </View>
                        <View style={styles.actionContainer}>
                          <TouchableOpacity style={[styles.actionBtn, styles.declineBtn]} onPress={() => updateAppointmentStatus(appt.id, 'cancelled')}>
                            <XCircle size={18} color="#DC2626" /><Text style={styles.declineText}>Decline</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={[styles.actionBtn, styles.acceptBtn]} onPress={() => updateAppointmentStatus(appt.id, 'confirmed')}>
                            <CheckCircle size={18} color="#059669" /><Text style={styles.acceptText}>Approve</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </>
                )}
              </>
            )}
          </AnimatedView>
        )}

        {/* ========================================== */}
        {/* UNIVERSAL SECTION: EXPLORE GRID            */}
        {/* ========================================== */}
        <AnimatedView delay={200}>
          <Text style={[styles.sectionTitle, { marginTop: 15 }]}>Explore</Text>
          <View style={styles.grid}>
            
            <TouchableOpacity style={[styles.card, { backgroundColor: '#EBF0E6', width: cardWidth }]} onPress={() => router.push('/(drawer)/meridians')} activeOpacity={0.8}>
              <View style={[styles.iconCircle, { backgroundColor: Colors.primary }]}><Network size={26} color="#FFF" /></View>
              <Text style={styles.cardTitle}>Meridians</Text>
              <Text style={styles.cardSubtitle}>12 Pathways</Text>
            </TouchableOpacity>

            {/* ONLY SHOW THERAPISTS TO PATIENTS */}
            {userRole !== 'therapist' && (
              <TouchableOpacity style={[styles.card, { backgroundColor: '#F8F4E6', width: cardWidth }]} onPress={() => router.push('/(drawer)/therapists')} activeOpacity={0.8}>
                <View style={[styles.iconCircle, { backgroundColor: '#D4B872' }]}><Search size={26} color="#FFF" /></View>
                <Text style={styles.cardTitle}>Find Therapist</Text>
                <Text style={styles.cardSubtitle}>Book a Session</Text>
              </TouchableOpacity>
            )}

            {/* ONLY SHOW PATIENT CRM TO THERAPISTS */}
            {userRole === 'therapist' && (
              <TouchableOpacity style={[styles.card, { backgroundColor: '#F8F4E6', width: cardWidth }]} onPress={() => router.push('/(drawer)/patients')} activeOpacity={0.8}>
                <View style={[styles.iconCircle, { backgroundColor: '#D4B872' }]}><Users size={26} color="#FFF" /></View>
                <Text style={styles.cardTitle}>Patient CRM</Text>
                <Text style={styles.cardSubtitle}>Manage Records</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={[styles.card, { backgroundColor: '#F2EBE1', width: cardWidth }]} onPress={() => router.push('/(drawer)/tools')} activeOpacity={0.8}>
              <View style={[styles.iconCircle, { backgroundColor: '#A89F91' }]}><ShoppingCart size={26} color="#FFF" /></View>
              <Text style={styles.cardTitle}>Shop Tools</Text>
              <Text style={styles.cardSubtitle}>Equip Yourself</Text>
            </TouchableOpacity>

            {/* ONLY SHOW FAVORITES TO PATIENTS */}
            {userRole !== 'therapist' && (
              <TouchableOpacity style={[styles.card, { backgroundColor: '#EAEBE6', width: cardWidth }]} onPress={() => router.push('/(drawer)/favorites')} activeOpacity={0.8}>
                <View style={[styles.iconCircle, { backgroundColor: '#8E9A85' }]}><Heart size={26} color="#FFF" /></View>
                <Text style={styles.cardTitle}>Favorites</Text>
                <Text style={styles.cardSubtitle}>Saved Points</Text>
              </TouchableOpacity>
            )}

            {/* ONLY SHOW SCHEDULE TO THERAPISTS */}
            {userRole === 'therapist' && (
              <TouchableOpacity style={[styles.card, { backgroundColor: '#EAEBE6', width: cardWidth }]} onPress={() => router.push('/(drawer)/schedule')} activeOpacity={0.8}>
                <View style={[styles.iconCircle, { backgroundColor: '#8E9A85' }]}><Clock size={26} color="#FFF" /></View>
                <Text style={styles.cardTitle}>My Schedule</Text>
                <Text style={styles.cardSubtitle}>Manage Hours</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={[styles.card, { backgroundColor: '#F5ECE4', width: cardWidth }]} onPress={() => router.push('/(drawer)/about')} activeOpacity={0.8}>
              <View style={[styles.iconCircle, { backgroundColor: '#CD8B62' }]}><Book size={26} color="#FFF" /></View>
              <Text style={styles.cardTitle}>TCM Basics</Text>
              <Text style={styles.cardSubtitle}>Start Learning</Text>
            </TouchableOpacity>
            
          </View>
        </AnimatedView>

        {/* --- UNIVERSAL: DID YOU KNOW? --- */}
        <AnimatedView delay={300}>
          <Text style={styles.sectionTitle}>💡 Did You Know?</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>"{dailyFact}"</Text>
          </View>
        </AnimatedView>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 20 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 20 },
  greeting: { fontSize: 16, color: Colors.textSecondary },
  username: { fontSize: 24, fontWeight: 'bold', color: Colors.textPrimary },
  
  therapistWelcomeBlock: { marginBottom: 20, marginTop: 10 },

  homeSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: { marginRight: 10 },
  searchPlaceholder: { fontSize: 16, color: Colors.textSecondary },

  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 15, marginTop: 5 },
  
  dailyCard: { 
    backgroundColor: Colors.primary, 
    borderRadius: 20, 
    padding: 20, 
    marginBottom: 30, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 8, 
    elevation: 4,
    overflow: 'hidden', 
    position: 'relative'
  },
  dailyContent: { flexDirection: 'row', alignItems: 'center', zIndex: 1 },
  dailyBadge: { backgroundColor: 'rgba(255,255,255,0.25)', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  dailyCode: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  dailyName: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  dailyBenefit: { color: 'rgba(255,255,255,0.9)', fontSize: 14, flex: 1 },
  bgIcon: { position: 'absolute', right: -10, bottom: -10, opacity: 0.5 },

  // Grid System
  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between'
  },
  card: { 
    borderRadius: 16, 
    padding: 18, 
    marginBottom: 15 
  },
  iconCircle: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: Colors.textSecondary },

  // Info Box
  infoBox: { backgroundColor: Colors.surface, padding: 20, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: Colors.accent },
  infoText: { fontSize: 15, color: Colors.textSecondary, lineHeight: 24, fontStyle: 'italic' },

  // Therapist Specific Styles
  statsRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: Colors.surface, padding: 20, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, alignItems: 'center' },
  statNumber: { fontSize: 28, fontWeight: 'bold', color: Colors.textPrimary, marginVertical: 8 },
  statLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  
  emptyCard: { backgroundColor: '#FAFAF5', padding: 20, borderRadius: 12, alignItems: 'center', marginBottom: 24 },
  emptyText: { color: Colors.textSecondary, fontStyle: 'italic' },
  
  agendaCard: { flexDirection: 'column', backgroundColor: Colors.surface, borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  timeBlock: { width: '100%', borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: 8, marginBottom: 8 },
  timeText: { fontSize: 15, fontWeight: 'bold', color: Colors.primary },
  agendaDetails: { flex: 1 },
  patientName: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  patientNotes: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },

  requestCard: { backgroundColor: Colors.surface, borderRadius: 16, marginBottom: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  requestHeader: { marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  requestDate: { fontSize: 15, fontWeight: 'bold', color: Colors.textPrimary },
  requestBody: { gap: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionContainer: { flexDirection: 'row', marginTop: 16, gap: 12 },
  actionBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 10, borderRadius: 8, gap: 6, borderWidth: 1 },
  declineBtn: { backgroundColor: '#FEF2F2', borderColor: '#FEE2E2' },
  declineText: { color: '#DC2626', fontWeight: '600', fontSize: 14 },
  acceptBtn: { backgroundColor: '#ECFDF5', borderColor: '#D1FAE5' },
  acceptText: { color: '#059669', fontWeight: '600', fontSize: 14 },

  // Video Call Button
  videoButton: { 
    backgroundColor: Colors.primary, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 10, 
    borderRadius: 8, 
    marginTop: 12, 
    gap: 8 
  },
  videoButtonText: { 
    color: '#FFF', 
    fontSize: 14, 
    fontWeight: '600' 
  },

  // Intake Display Styles
  intakeBox: { 
    backgroundColor: '#FAFAF5', 
    padding: 12, 
    borderRadius: 8, 
    marginTop: 10, 
    borderWidth: 1, 
    borderColor: '#EAEAEA' 
  },
  intakeBadge: { 
    color: '#059669', 
    fontSize: 11, 
    fontWeight: '700', 
    textTransform: 'uppercase', 
    letterSpacing: 0.5, 
    marginBottom: 8 
  },
  intakeLabel: { 
    fontSize: 13, 
    fontWeight: '700', 
    color: Colors.textPrimary 
  },
  intakeValue: { 
    fontSize: 13, 
    color: Colors.textSecondary, 
    lineHeight: 20, 
    marginBottom: 4 
  },
});