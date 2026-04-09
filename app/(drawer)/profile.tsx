import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Award,
  CalendarClock,
  Camera,
  ClipboardList,
  Edit2,
  FileText, 
  LogOut,
  MapPin,
  ShieldAlert,
  Stethoscope,
  User,
  Video,
  Mail,
  ExternalLink,
  Package // <-- NEW: Imported Package icon for orders
} from 'lucide-react-native';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Linking
} from 'react-native';

import { Colors } from '../../constants/Colors';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabase';

export default function ProfileScreen() {
  const { session, signOut } = useAuth();
  const router = useRouter();
  
  const [profileData, setProfileData] = useState<any>(null);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [treatmentRecords, setTreatmentRecords] = useState<any[]>([]);
  const [myOrders, setMyOrders] = useState<any[]>([]); // <-- NEW: Orders State
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Tab states for both roles
  const [activeTab, setActiveTab] = useState<'upcoming' | 'records' | 'orders'>('upcoming');
  const [therapistTab, setTherapistTab] = useState<'profile' | 'orders'>('profile');

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  
  const [editBio, setEditBio] = useState('');
  const [editSpecialties, setEditSpecialties] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editContactEmail, setEditContactEmail] = useState(''); 
  const [editWebsite, setEditWebsite] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const fetchProfileAndAppointments = async () => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    try {
      // 1. Fetch Profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) throw profileError;
      
      setProfileData(profile);
      setEditName(profile?.full_name || '');
      setEditPhone(profile?.phone || '');
      setEditBio(profile?.bio || '');
      setEditSpecialties(profile?.specialties || '');
      setEditAddress(profile?.clinic_address || '');
      setEditContactEmail(profile?.contact_email || ''); 
      setEditWebsite(profile?.website || '');
      if (profile?.avatar_url) setAvatarUri(profile.avatar_url);

      // 2. Fetch Shop Orders (Universal for both Patients & Therapists)
      const { data: ordersData, error: ordersError } = await supabase
        .from('shop_orders')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
        
      if (!ordersError && ordersData) {
        setMyOrders(ordersData);
      }

      // 3. Fetch Patient-Specific Data
      if (!profile?.is_therapist) {
        const { data: appointments, error: apptError } = await supabase
          .from('appointments')
          .select(`id, scheduled_at, status, symptoms, intake_completed, therapist:profiles!appointments_therapist_id_fkey(full_name)`)
          .eq('patient_id', session.user.id)
          .order('scheduled_at', { ascending: false });

        if (apptError) throw apptError;

        if (appointments) {
          const nowTime = new Date().getTime();
          const upcomingAppts: any[] = [];

          appointments.forEach(appt => {
            const apptTime = new Date(appt.scheduled_at).getTime();
            const sessionEndTime = apptTime + (60 * 60 * 1000); 

            if (sessionEndTime >= nowTime && ['pending', 'confirmed', 'cancelled'].includes(appt.status)) {
              upcomingAppts.push(appt);
            }
          });

          upcomingAppts.sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
          setUpcoming(upcomingAppts);
        }

        const { data: recordsData, error: recordsError } = await supabase
          .from('treatment_records')
          .select(`id, date, issue_presented, prescription, therapist:profiles!treatment_records_therapist_id_fkey(full_name)`)
          .eq('patient_id', session.user.id)
          .order('date', { ascending: false });
          
        if (!recordsError && recordsData) {
          setTreatmentRecords(recordsData);
        }
      }
    } catch (error: any) {
      console.error('Error fetching profile data:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfileAndAppointments();
    }, [session?.user?.id])
  );

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You need to allow camera roll access to upload a photo.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], 
      quality: 0.5,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri); 
    }
  };

  const handleSaveProfile = async () => {
    if (!session?.user?.id) return;
    setSavingProfile(true);

    try {
      const payload: any = {
        full_name: editName.trim(),
        phone: editPhone.trim()
      };

      if (profileData?.role === 'therapist') {
        payload.bio = editBio.trim();
        payload.specialties = editSpecialties.trim();
        payload.clinic_address = editAddress.trim();
        payload.contact_email = editContactEmail.trim(); 
        payload.website = editWebsite.trim(); 
      }

      const { error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', session.user.id);

      if (error) throw error;

      setProfileData({ ...profileData, ...payload });
      setIsEditing(false);
    } catch (error: any) {
      Alert.alert("Update Failed", error.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm("Are you sure you want to log out?");
      if (confirmed) {
        signOut().then(() => window.location.replace('/')).catch((err) => console.error(err));
      }
    } else {
      Alert.alert("Sign Out", "Are you sure you want to log out?", [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Log Out", style: "destructive", 
          onPress: async () => { 
            try { await signOut(); router.replace('/'); } 
            catch (error: any) { Alert.alert("Logout Failed", error.message); }
          } 
        }
      ]);
    }
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    };
  };

  // --- RENDERERS ---

  const renderOrderCard = (item: any) => {
    const { date } = formatDateTime(item.created_at);
    
    let badgeColor = '#FEF3C7'; let textColor = '#92400E';
    if (item.status === 'Shipped') { badgeColor = '#E0F2FE'; textColor = '#1E3A8A'; }
    if (item.status === 'Delivered') { badgeColor = '#DEF7EC'; textColor = '#03543F'; }

    return (
      <View key={item.id} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.dateTimeContainer}>
            <Package size={18} color={Colors.textSecondary} />
            <Text style={styles.dateText}>Ordered on {date}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: badgeColor }]}>
            <Text style={[styles.statusText, { color: textColor }]}>{item.status?.toUpperCase() || 'PENDING'}</Text>
          </View>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.cardBody}>
          {item.order_items?.map((cartItem: any, index: number) => (
             <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
               <Text style={{ fontSize: 15, color: Colors.textPrimary }}>{cartItem.quantity}x {cartItem.name}</Text>
               <Text style={{ fontSize: 15, color: Colors.textSecondary }}>₹{cartItem.subtotal}</Text>
             </View>
          ))}
          
          <View style={{ height: 1, backgroundColor: '#F0F0F0', marginVertical: 8 }} />
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 14, color: Colors.textSecondary, fontWeight: '600' }}>Total Amount</Text>
            <Text style={{ fontSize: 16, color: Colors.primary, fontWeight: 'bold' }}>₹{item.total_amount}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderAppointment = ({ item }: { item: any }) => {
    const { date, time } = formatDateTime(item.scheduled_at);
    let badgeColor = '#FEF3C7'; let textColor = '#92400E'; let statusText = 'PENDING';

    if (item.status === 'confirmed') { 
      badgeColor = '#DEF7EC'; textColor = '#03543F'; statusText = 'APPROVED'; 
    } else if (item.status === 'cancelled') { 
      badgeColor = '#FEE2E2'; textColor = '#991B1B'; statusText = 'DECLINED'; 
    }

    const apptTime = new Date(item.scheduled_at).getTime();
    const nowTime = new Date().getTime();
    const fifteenMinsBefore = apptTime - (15 * 60 * 1000);
    const sixtyMinsAfter = apptTime + (60 * 60 * 1000); 
    
    const isBeforeCall = nowTime < fifteenMinsBefore;
    const isPastCall = nowTime > sixtyMinsAfter;
    const isTimeForCall = nowTime >= fifteenMinsBefore && nowTime <= sixtyMinsAfter;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.dateTimeContainer}>
            <CalendarClock size={18} color={Colors.primary} />
            <Text style={styles.dateText}>{date} at {time}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: badgeColor }]}><Text style={[styles.statusText, { color: textColor }]}>{statusText}</Text></View>
        </View>
        <View style={styles.divider} />
        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <User size={16} color={Colors.textSecondary} />
            <Text style={styles.infoText}>{item.therapist?.full_name || 'Dr. Assigned Therapist'}</Text>
          </View>
          
          {item.symptoms && (
            <View style={[styles.infoRow, { alignItems: 'flex-start' }]}>
              <FileText size={16} color={Colors.textSecondary} style={{ marginTop: 2 }} />
              <Text style={styles.infoText}>Notes: {item.symptoms}</Text>
            </View>
          )}

          {item.status === 'cancelled' && (
             <Text style={{ fontStyle: 'italic', color: '#991B1B', marginTop: 10, fontSize: 13 }}>
               The therapist is unable to accommodate this time slot. Please request a different time.
             </Text>
          )}

          {item.status === 'confirmed' && !item.intake_completed && (
            <TouchableOpacity 
              style={[styles.videoButton, { backgroundColor: '#D4B872' }]} 
              onPress={() => router.push(`/(drawer)/intake/${item.id}`)}
            >
              <FileText size={18} color="#FFF" />
              <Text style={styles.videoButtonText}>Action Required: Intake Form</Text>
            </TouchableOpacity>
          )}

          {item.status === 'confirmed' && item.intake_completed && (
            <TouchableOpacity 
              style={[styles.videoButton, !isTimeForCall && { backgroundColor: '#9CA3AF' }]}
              disabled={!isTimeForCall}
              onPress={() => {
                const roomUrl = `https://meet.jit.si/AcuSpace-Consultation-${item.id}`;
                Linking.openURL(roomUrl);
              }}
            >
              <Video size={18} color="#FFF" />
              <Text style={styles.videoButtonText}>
                {isBeforeCall ? 'Call opens 15 mins before' : isPastCall ? 'Session Ended' : 'Join Video Call'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderRecordCard = ({ item }: { item: any }) => {
    const { date } = formatDateTime(item.date);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.dateTimeContainer}>
            <ClipboardList size={18} color={Colors.textSecondary} />
            <Text style={styles.dateText}>{date}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: '#F3F4F6' }]}>
            <Text style={[styles.statusText, { color: '#4B5563' }]}>CLINICAL RECORD</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Stethoscope size={16} color={Colors.textSecondary} />
            <Text style={styles.infoText}>Treated by {item.therapist?.full_name || 'Clinic Therapist'}</Text>
          </View>
          
          {item.issue_presented && (
            <View style={[styles.infoRow, { alignItems: 'flex-start', marginTop: 4 }]}>
              <FileText size={16} color={Colors.textSecondary} style={{ marginTop: 2 }} />
              <Text style={styles.infoText}>Condition: {item.issue_presented}</Text>
            </View>
          )}

          {item.prescription ? (
            <View style={styles.prescriptionBox}>
              <Text style={styles.prescriptionLabel}>Prescription / Care Plan:</Text>
              <Text style={styles.prescriptionValue}>{item.prescription}</Text>
            </View>
          ) : null}
        </View>
      </View>
    );
  };

  if (loading) return <View style={styles.centerContainer}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  if (!session?.user) {
    return (
      <View style={styles.authGateContainer}>
        <ShieldAlert size={64} color={Colors.primary} style={{ marginBottom: 20 }} />
        <Text style={styles.authGateTitle}>Authentication Required</Text>
        <Text style={styles.authGateSubtitle}>Please log in or create an account to view your personal profile and manage appointments.</Text>
        <TouchableOpacity style={styles.authGateButton} onPress={() => router.push('/login')}><Text style={styles.authGateButtonText}>Log In to AcuSpace</Text></TouchableOpacity>
      </View>
    );
  }

  // ==========================================
  // --- THERAPIST RENDER ---
  // ==========================================
  if (profileData?.role === 'therapist') {
    return (
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchProfileAndAppointments(); }} colors={[Colors.primary]} />}
      >
        <View style={styles.contentMaxWidth}>
          
          {/* Header Profile Box */}
          <View style={styles.profileHeader}>
            <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper} activeOpacity={0.8}>
              {avatarUri ? <Image source={{ uri: avatarUri }} style={styles.avatarImage} /> : <View style={styles.avatarCircle}><Text style={styles.avatarText}>{profileData?.full_name ? profileData.full_name.charAt(0).toUpperCase() : 'Dr'}</Text></View>}
              <View style={styles.cameraBadge}><Camera size={12} color="#FFF" /></View>
            </TouchableOpacity>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profileData?.full_name || 'Dr. Name'}</Text>
              <Text style={styles.profilePhone}>{profileData?.phone || 'Add phone'}</Text>
              <Text style={styles.profileEmail}>{session.user.email}</Text>
              <View style={styles.therapistTag}><Text style={styles.therapistTagText}>Therapist Account</Text></View>
            </View>
            {!isEditing && therapistTab === 'profile' && (
              <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editPill}>
                <Edit2 size={14} color={Colors.primary} /><Text style={styles.editPillText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Therapist Tab Switcher */}
          {!isEditing && (
            <View style={styles.tabContainer}>
              <TouchableOpacity style={[styles.tab, therapistTab === 'profile' && styles.activeTab]} onPress={() => setTherapistTab('profile')}>
                <User size={18} color={therapistTab === 'profile' ? Colors.primary : Colors.textSecondary} />
                <Text style={[styles.tabText, therapistTab === 'profile' && styles.activeTabText]}>Profile Info</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.tab, therapistTab === 'orders' && styles.activeTab]} onPress={() => setTherapistTab('orders')}>
                <Package size={18} color={therapistTab === 'orders' ? Colors.primary : Colors.textSecondary} />
                <Text style={[styles.tabText, therapistTab === 'orders' && styles.activeTabText]}>Shop Orders</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Main Content Area based on Tab */}
          {isEditing ? (
            <View style={styles.editCard}>
              <Text style={styles.editCardTitle}>Public Profile Settings</Text>
              <Text style={styles.label}>Personal Details</Text>
              <TextInput style={styles.editInput} placeholder="Full Name (e.g., Dr. Jane Doe)" value={editName} onChangeText={setEditName} />
              <TextInput style={styles.editInput} placeholder="Mobile Number" keyboardType="numeric" value={editPhone} onChangeText={(text) => setEditPhone(text.replace(/[^0-9]/g, ''))} />
              
              <Text style={[styles.label, { marginTop: 12 }]}>Public Contact Email</Text>
              <TextInput style={styles.editInput} placeholder="e.g., hello@clinic.com" value={editContactEmail} onChangeText={setEditContactEmail} keyboardType="email-address" autoCapitalize="none" />
              
              <Text style={[styles.label, { marginTop: 12 }]}>External Profile Link / Website</Text>
              <TextInput style={styles.editInput} placeholder="e.g., https://myclinic.com" value={editWebsite} onChangeText={setEditWebsite} autoCapitalize="none" autoCorrect={false} />
              
              <Text style={[styles.label, { marginTop: 12 }]}>Professional Bio</Text>
              <TextInput style={[styles.editInput, { height: 100, textAlignVertical: 'top' }]} placeholder="Tell patients about your experience and approach..." multiline value={editBio} onChangeText={setEditBio} />
              
              <Text style={[styles.label, { marginTop: 12 }]}>Specialties</Text>
              <TextInput style={styles.editInput} placeholder="e.g., Pain Management, Cupping, Herbal Medicine" value={editSpecialties} onChangeText={setEditSpecialties} />

              <Text style={[styles.label, { marginTop: 12 }]}>Clinic Address</Text>
              <TextInput style={[styles.editInput, { height: 80, textAlignVertical: 'top' }]} placeholder="Full clinic address..." multiline value={editAddress} onChangeText={setEditAddress} />

              <View style={styles.editActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsEditing(false)}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile} disabled={savingProfile}>
                  {savingProfile ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.saveBtnText}>Save Profile</Text>}
                </TouchableOpacity>
              </View>
            </View>
          ) : therapistTab === 'profile' ? (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Public Profile Preview</Text>
              
              <View style={styles.previewSection}>
                <View style={styles.previewRow}><Stethoscope size={20} color={Colors.primary} /><Text style={styles.previewTitle}>About Me</Text></View>
                <Text style={styles.previewText}>{profileData?.bio || 'No bio added yet. Click Edit to tell patients about yourself.'}</Text>
              </View>

              <View style={styles.previewSection}>
                <View style={styles.previewRow}><Award size={20} color={Colors.primary} /><Text style={styles.previewTitle}>Specialties</Text></View>
                <Text style={styles.previewText}>{profileData?.specialties || 'No specialties added.'}</Text>
              </View>

              <View style={styles.previewSection}>
                <View style={styles.previewRow}><MapPin size={20} color={Colors.primary} /><Text style={styles.previewTitle}>Clinic Location</Text></View>
                <Text style={styles.previewText}>{profileData?.clinic_address || 'No address added.'}</Text>
              </View>

              <View style={styles.previewSection}>
                <View style={styles.previewRow}><Mail size={20} color={Colors.primary} /><Text style={styles.previewTitle}>Public Contact Email</Text></View>
                <Text style={styles.previewText}>{profileData?.contact_email || 'No public email added.'}</Text>
              </View>

              <View style={[styles.previewSection, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                <View style={styles.previewRow}><ExternalLink size={20} color={Colors.primary} /><Text style={styles.previewTitle}>Profile Link</Text></View>
                <Text style={styles.previewText}>{profileData?.website || 'No link added.'}</Text>
              </View>
            </View>
          ) : (
            /* Therapist Orders View */
            <View>
              {myOrders.length === 0 ? (
                 <View style={styles.emptyContainer}>
                   <Package size={48} color="#E5E7EB" style={{ marginBottom: 12 }} />
                   <Text style={styles.emptyTitle}>You haven't ordered any tools yet.</Text>
                 </View>
              ) : (
                 myOrders.map(order => renderOrderCard(order))
              )}
            </View>
          )}

          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <LogOut size={20} color="#EF4444" /><Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // ==========================================
  // --- PATIENT RENDER ---
  // ==========================================
  let currentData = upcoming;
  if (activeTab === 'records') currentData = treatmentRecords;
  if (activeTab === 'orders') currentData = myOrders;

  return (
    <View style={styles.container}>
      <FlatList
        data={currentData}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchProfileAndAppointments(); }} colors={[Colors.primary]} />}
        ListHeaderComponent={(
          <View style={styles.contentMaxWidth}>
            <View style={styles.profileHeader}>
              <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper} activeOpacity={0.8}>
                {avatarUri ? <Image source={{ uri: avatarUri }} style={styles.avatarImage} /> : <View style={styles.avatarCircle}><Text style={styles.avatarText}>{profileData?.full_name ? profileData.full_name.charAt(0).toUpperCase() : 'U'}</Text></View>}
                <View style={styles.cameraBadge}><Camera size={12} color="#FFF" /></View>
              </TouchableOpacity>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{profileData?.full_name || 'Add your name'}</Text>
                <Text style={styles.profilePhone}>{profileData?.phone || 'Add your phone number'}</Text>
                <Text style={styles.profileEmail}>{session.user.email}</Text>
              </View>
              {!isEditing && (
                <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editPill}>
                  <Edit2 size={14} color={Colors.primary} /><Text style={styles.editPillText}>Edit</Text>
                </TouchableOpacity>
              )}
            </View>

            {isEditing && (
              <View style={styles.editCard}>
                <Text style={styles.editCardTitle}>Update Profile</Text>
                <TextInput style={styles.editInput} placeholder="Full Name" value={editName} onChangeText={setEditName} />
                <TextInput style={styles.editInput} placeholder="Mobile Number" keyboardType="numeric" value={editPhone} onChangeText={(text) => setEditPhone(text.replace(/[^0-9]/g, ''))} />
                <View style={styles.editActions}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsEditing(false)}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile} disabled={savingProfile}>
                    {savingProfile ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Patient Tab Switcher */}
            {!isEditing && (
              <View style={styles.tabContainer}>
                <TouchableOpacity style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]} onPress={() => setActiveTab('upcoming')}>
                  <CalendarClock size={16} color={activeTab === 'upcoming' ? Colors.primary : Colors.textSecondary} />
                  <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>Upcoming</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, activeTab === 'records' && styles.activeTab]} onPress={() => setActiveTab('records')}>
                  <ClipboardList size={16} color={activeTab === 'records' ? Colors.primary : Colors.textSecondary} />
                  <Text style={[styles.tabText, activeTab === 'records' && styles.activeTabText]}>Records</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, activeTab === 'orders' && styles.activeTab]} onPress={() => setActiveTab('orders')}>
                  <Package size={16} color={activeTab === 'orders' ? Colors.primary : Colors.textSecondary} />
                  <Text style={[styles.tabText, activeTab === 'orders' && styles.activeTabText]}>Orders</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.contentMaxWidth}>
            {activeTab === 'upcoming' && renderAppointment({ item })}
            {activeTab === 'records' && renderRecordCard({ item })}
            {activeTab === 'orders' && renderOrderCard(item)}
          </View>
        )}
        ListEmptyComponent={(
          !isEditing ? (
            <View style={styles.emptyContainer}>
              {activeTab === 'upcoming' && <CalendarClock size={48} color="#E5E7EB" style={{ marginBottom: 12 }} />}
              {activeTab === 'records' && <ClipboardList size={48} color="#E5E7EB" style={{ marginBottom: 12 }} />}
              {activeTab === 'orders' && <Package size={48} color="#E5E7EB" style={{ marginBottom: 12 }} />}
              <Text style={styles.emptyTitle}>
                {activeTab === 'upcoming' ? 'No upcoming appointments' : 
                 activeTab === 'records' ? 'No clinical records found' : 
                 'No tool orders found'}
              </Text>
            </View>
          ) : null
        )}
        ListFooterComponent={(
          <View style={styles.contentMaxWidth}>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <LogOut size={20} color="#EF4444" /><Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },
  contentMaxWidth: { maxWidth: 800, width: '100%', alignSelf: 'center' },
  
  authGateContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, backgroundColor: Colors.background },
  authGateTitle: { fontSize: 24, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12, textAlign: 'center' },
  authGateSubtitle: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center', marginBottom: 30, lineHeight: 24 },
  authGateButton: { backgroundColor: Colors.primary, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12 },
  authGateButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },

  profileHeader: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, 
    padding: 20, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: '#EAEAEA', 
    ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 }, android: { elevation: 2 }, web: { boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)' } }) 
  },
  
  avatarWrapper: { position: 'relative', marginRight: 16 },
  avatarCircle: { width: 68, height: 68, borderRadius: 34, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarImage: { width: 68, height: 68, borderRadius: 34 },
  avatarText: { fontSize: 26, fontWeight: '700', color: Colors.surface },
  cameraBadge: { position: 'absolute', bottom: 0, right: -4, backgroundColor: Colors.textPrimary, width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.surface },
  
  profileInfo: { flex: 1, justifyContent: 'center' },
  profileName: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  profilePhone: { fontSize: 14, color: Colors.textPrimary, marginBottom: 2 },
  profileEmail: { fontSize: 13, color: Colors.textSecondary },
  
  therapistTag: { backgroundColor: '#E1EFFE', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginTop: 6 },
  therapistTagText: { color: '#1E429F', fontSize: 12, fontWeight: '600' },

  editPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 4 },
  editPillText: { fontSize: 13, fontWeight: '600', color: Colors.primary },

  editCard: { backgroundColor: Colors.surface, padding: 20, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: '#E5E7EB', borderStyle: 'dashed' },
  editCardTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginBottom: 6 },
  editInput: { backgroundColor: Colors.background, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: Colors.textPrimary, marginBottom: 12 },
  editActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 8 },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  cancelBtnText: { color: Colors.textSecondary, fontWeight: '600', fontSize: 14 },
  saveBtn: { backgroundColor: Colors.primary, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, minWidth: 120, alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontWeight: '600', fontSize: 14 },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 16 },
  previewSection: { marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  previewTitle: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  previewText: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22 },

  tabContainer: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: 12, padding: 4, marginBottom: 16, borderWidth: 1, borderColor: '#EAEAEA' },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 8, gap: 8 },
  activeTab: { backgroundColor: Colors.safetyBackground },
  tabText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  activeTabText: { color: Colors.primary },

  card: { backgroundColor: Colors.surface, borderRadius: 12, marginBottom: 16, padding: 16, borderWidth: 1, borderColor: '#EAEAEA' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  dateTimeContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateText: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginBottom: 12 },
  cardBody: { gap: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { fontSize: 14, color: Colors.textSecondary, flex: 1 },
  
  emptyContainer: { padding: 40, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  emptyTitle: { fontSize: 18, color: Colors.textSecondary, fontWeight: '500' },

  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEF2F2', paddingVertical: 16, borderRadius: 12, marginTop: 10, gap: 8, borderWidth: 1, borderColor: '#FEE2E2' },
  logoutText: { color: '#EF4444', fontSize: 16, fontWeight: '600' },

  videoButton: { 
    backgroundColor: Colors.primary, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 12, 
    borderRadius: 8, 
    marginTop: 14, 
    gap: 8 
  },
  videoButtonText: { 
    color: '#FFF', 
    fontSize: 15, 
    fontWeight: '600' 
  },

  prescriptionBox: { 
    backgroundColor: '#DEF7EC', 
    padding: 12, 
    borderRadius: 8, 
    marginTop: 10, 
    borderWidth: 1, 
    borderColor: '#A7F3D0' 
  },
  prescriptionLabel: { 
    fontSize: 12, 
    fontWeight: 'bold', 
    color: '#047857', 
    textTransform: 'uppercase', 
    letterSpacing: 0.5, 
    marginBottom: 4 
  },
  prescriptionValue: { 
    fontSize: 14, 
    color: '#065F46', 
    fontWeight: '500', 
    lineHeight: 22 
  },
});