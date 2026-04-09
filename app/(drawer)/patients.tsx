import { decode } from 'base64-arraybuffer';
import * as ImagePicker from 'expo-image-picker';
import { Activity, Calendar, ChevronDown, ChevronUp, ClipboardList, FileText, Image as ImageIcon, Phone, Plus, Search, User, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
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

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export default function PatientsCRMScreen() {
  const { session } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPatientId, setExpandedPatientId] = useState<string | null>(null);

  // --- Record Modal State ---
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [selectedPatientForRecord, setSelectedPatientForRecord] = useState<any>(null);
  const [issue, setIssue] = useState('');
  const [treatment, setTreatment] = useState('');
  const [prescription, setPrescription] = useState(''); // NEW: Prescription State
  const [recordImages, setRecordImages] = useState<{ uri: string, base64: string }[]>([]); 
  const [notes, setNotes] = useState('');
  const [savingRecord, setSavingRecord] = useState(false);

  // --- Add Patient Modal State ---
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientPhone, setNewPatientPhone] = useState('');
  const [savingPatient, setSavingPatient] = useState(false);

  // --- Full-Screen Image Viewer ---
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchPatientsAndRecords();
    }
  }, [session]);

  const fetchPatientsAndRecords = async () => {
    setLoading(true);
    try {
      const { data: apptData, error: apptError } = await supabase
        .from('appointments')
        .select(`id, scheduled_at, intake_completed, intake_data, patient_id, patient:profiles!appointments_patient_id_fkey(id, full_name, phone)`)
        .eq('therapist_id', session!.user.id);

      if (apptError) throw apptError;

      const { data: recordsData, error: recordsError } = await supabase
        .from('treatment_records')
        .select('*, patient:profiles!treatment_records_patient_id_fkey(id, full_name, phone)')
        .eq('therapist_id', session!.user.id)
        .order('date', { ascending: false });

      if (recordsError) throw recordsError;

      if (recordsData) {
        for (let record of recordsData) {
          if (record.image_urls && record.image_urls.length > 0) {
            const signedUrls = [];
            for (let path of record.image_urls) {
              const { data } = await supabase.storage.from('medical_records').createSignedUrl(path, 3600);
              if (data) signedUrls.push(data.signedUrl);
            }
            record.secure_display_urls = signedUrls; 
          }
        }
      }

      const patientMap = new Map();
      
      if (apptData) {
        apptData.forEach((appt: any) => {
          if (appt.patient && !patientMap.has(appt.patient.id)) {
            patientMap.set(appt.patient.id, { ...appt.patient, records: [] });
          }
          if (appt.intake_completed && appt.intake_data) {
            patientMap.get(appt.patient.id).records.push({
              is_intake: true,
              id: `intake_${appt.id}`,
              date: appt.scheduled_at,
              intake_data: appt.intake_data
            });
          }
        });
      }

      if (recordsData) {
        recordsData.forEach((record: any) => {
          if (record.patient && !patientMap.has(record.patient_id)) {
            patientMap.set(record.patient_id, { ...record.patient, records: [] });
          }
          if (patientMap.has(record.patient_id)) {
            patientMap.get(record.patient_id).records.push({
              is_intake: false,
              ...record
            });
          }
        });
      }

      const patientArray = Array.from(patientMap.values()).map(p => {
        p.records.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return p;
      }).sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));
      
      setPatients(patientArray);
    } catch (error: any) {
      console.error("Error fetching CRM data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPatient = async () => {
    if (!newPatientName.trim() || !newPatientPhone.trim()) {
      alert("Please enter both a name and a phone number.");
      return;
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(newPatientPhone.trim())) {
      alert("Please enter a valid 10-digit Indian phone number.");
      return;
    }

    setSavingPatient(true);
    try {
      const newPatientId = generateUUID();
      
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: newPatientId, 
          full_name: newPatientName.trim(),
          phone: newPatientPhone.trim(),
          is_walk_in: true
        })
        .select()
        .single();

      if (profileError) throw profileError;

      const { error: recordError } = await supabase
        .from('treatment_records')
        .insert({
          patient_id: newProfile.id,
          therapist_id: session!.user.id,
          issue_presented: 'Initial Registration',
          treatment_given: 'Patient profile created manually.',
          private_notes: 'Walk-in / Manual Entry'
        });

      if (recordError) throw recordError;

      setNewPatientName('');
      setNewPatientPhone('');
      setShowAddPatientModal(false);
      fetchPatientsAndRecords();

    } catch (error: any) {
      alert("Failed to add patient. " + error.message);
    } finally {
      setSavingPatient(false);
    }
  };

  const handlePickImage = async () => {
    if (recordImages.length >= 5) {
      alert("You can only upload up to 5 photos per record.");
      return;
    }

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("You've refused permission to allow this app to access your photos!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 5 - recordImages.length,
      quality: 0.5, 
      base64: true,
    });

    if (!result.canceled && result.assets) {
      const newSelectedImages = result.assets.map(asset => ({
        uri: asset.uri,
        base64: asset.base64 || ''
      }));
      setRecordImages(prev => [...prev, ...newSelectedImages].slice(0, 5));
    }
  };

  const removeImage = (indexToRemove: number) => {
    setRecordImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSaveRecord = async () => {
    if (!issue.trim() || !treatment.trim()) {
      alert("Please fill in both the Issue and Treatment fields.");
      return;
    }

    setSavingRecord(true);
    let finalImagePaths: string[] = [];

    try {
      if (recordImages.length > 0) {
        for (let i = 0; i < recordImages.length; i++) {
          const img = recordImages[i];
          if (!img.base64) continue;

          const fileName = `${selectedPatientForRecord.id}_${new Date().getTime()}_${i}.jpg`;
          const filePath = `records/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('medical_records')
            .upload(filePath, decode(img.base64), { contentType: 'image/jpeg' });

          if (uploadError) throw uploadError;
          
          finalImagePaths.push(filePath);
        }
      }

      const { error: dbError } = await supabase.from('treatment_records').insert({
        patient_id: selectedPatientForRecord.id,
        therapist_id: session!.user.id,
        issue_presented: issue.trim(),
        treatment_given: treatment.trim(),
        prescription: prescription.trim() || null, // NEW: Save prescription to DB
        image_urls: finalImagePaths.length > 0 ? finalImagePaths : null,
        private_notes: notes.trim() || null
      });

      if (dbError) throw dbError;

      setIssue('');
      setTreatment('');
      setPrescription(''); // Reset prescription
      setRecordImages([]);
      setNotes('');
      setShowRecordModal(false);
      fetchPatientsAndRecords();

    } catch (error: any) {
      alert("Failed to save record: " + error.message);
    } finally {
      setSavingRecord(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    (p.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.phone || '').includes(searchQuery)
  );

  const renderPatientCard = ({ item }: { item: any }) => {
    const isExpanded = expandedPatientId === item.id;

    return (
      <View style={styles.card}>
        <TouchableOpacity style={styles.cardHeader} onPress={() => setExpandedPatientId(isExpanded ? null : item.id)} activeOpacity={0.7}>
          <View style={styles.avatarCircle}><Text style={styles.avatarText}>{(item.full_name || 'U').charAt(0).toUpperCase()}</Text></View>
          <View style={styles.patientInfo}>
            <Text style={styles.patientName}>{item.full_name || 'Unknown Patient'}</Text>
            <View style={styles.contactRow}>
              <Phone size={14} color={Colors.textSecondary} />
              <Text style={styles.contactText}>{item.phone || 'No phone provided'}</Text>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.contactText}>{item.records.length} Timeline Events</Text>
            </View>
          </View>
          {isExpanded ? <ChevronUp size={24} color={Colors.textSecondary} /> : <ChevronDown size={24} color={Colors.textSecondary} />}
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.actionHeader}>
              <Text style={styles.historyTitle}>Clinical Records</Text>
              <TouchableOpacity style={styles.addRecordBtn} onPress={() => { setSelectedPatientForRecord(item); setShowRecordModal(true); }}>
                <Plus size={16} color="#FFF" />
                <Text style={styles.addRecordText}>Add Record</Text>
              </TouchableOpacity>
            </View>

            {item.records.length === 0 ? (
              <View style={styles.emptyRecords}>
                <ClipboardList size={32} color="#D1D5DB" style={{ marginBottom: 8 }} />
                <Text style={styles.emptyRecordsText}>No treatment records or intakes yet.</Text>
              </View>
            ) : (
              <View style={styles.tableContainer}>
                {item.records.map((record: any, index: number) => (
                  
                  record.is_intake ? (
                    /* FIXED: Intake Block structurally mirrors the Standard Block to prevent font bleeding */
                    <View key={record.id} style={[styles.tableRow, index === item.records.length - 1 && { borderBottomWidth: 0 }, { backgroundColor: '#FAFAF5' }]}>
                      <View style={styles.dateCol}>
                        <Calendar size={14} color="#059669" style={{ marginBottom: 4 }} />
                        <Text style={styles.dateText}>{new Date(record.date).toLocaleDateString()}</Text>
                        <Text style={styles.timeText}>
                          {new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>
                      <View style={styles.detailsCol}>
                        <Text style={styles.intakeBadge}>Patient Intake Form</Text>
                        
                        <Text style={styles.recordLabel}>Primary Complaint:</Text>
                        <Text style={styles.recordValue}>{record.intake_data.main_complaint}</Text>
                        
                        {record.intake_data.duration ? (
                          <>
                            <Text style={[styles.recordLabel, { marginTop: 8 }]}>Duration:</Text>
                            <Text style={styles.recordValue}>{record.intake_data.duration}</Text>
                          </>
                        ) : null}
                        
                        {record.intake_data.tongue_pulse_notes ? (
                          <>
                            <Text style={[styles.recordLabel, { marginTop: 8 }]}>TCM Observations:</Text>
                            <Text style={styles.recordValue}>{record.intake_data.tongue_pulse_notes}</Text>
                          </>
                        ) : null}
                      </View>
                    </View>
                  ) : (
                    /* Standard Treatment Record Block */
                    <View key={record.id} style={[styles.tableRow, index === item.records.length - 1 && { borderBottomWidth: 0 }]}>
                      <View style={styles.dateCol}>
                        <Calendar size={14} color={Colors.primary} style={{ marginBottom: 4 }} />
                        <Text style={styles.dateText}>{new Date(record.date).toLocaleDateString()}</Text>
                        <Text style={styles.timeText}>
                          {new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>
                      <View style={styles.detailsCol}>
                        {record.issue_presented ? (
                          <>
                            <Text style={styles.recordLabel}>Issue:</Text>
                            <Text style={styles.recordValue}>{record.issue_presented}</Text>
                          </>
                        ) : null}
                        
                        {record.treatment_given ? (
                          <>
                            <Text style={[styles.recordLabel, { marginTop: 8 }]}>Treatment:</Text>
                            <Text style={styles.recordValue}>{record.treatment_given}</Text>
                          </>
                        ) : null}

                        {/* NEW: Display Prescription in the Timeline */}
                        {record.prescription ? (
                          <View style={styles.prescriptionBox}>
                            <Text style={styles.prescriptionLabel}>Prescription / Home Care:</Text>
                            <Text style={styles.prescriptionValue}>{record.prescription}</Text>
                          </View>
                        ) : null}
  
                        {record.secure_display_urls && record.secure_display_urls.length > 0 && (
                          <View style={styles.historyImageWrapper}>
                             <Text style={[styles.recordLabel, { marginTop: 8, marginBottom: 4 }]}>Condition Photos:</Text>
                             <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                               {record.secure_display_urls.map((url: string, idx: number) => (
                                 <TouchableOpacity 
                                   key={idx} 
                                   onPress={() => setFullScreenImage(url)} 
                                   activeOpacity={0.8}
                                 >
                                   <Image source={{ uri: url }} style={styles.historyImageThumbnail} />
                                 </TouchableOpacity>
                               ))}
                             </ScrollView>
                          </View>
                        )}
                        
                        {record.private_notes && (
                          <>
                            <Text style={[styles.recordLabel, { marginTop: 8 }]}>Notes:</Text>
                            <Text style={[styles.recordValue, { fontStyle: 'italic', color: Colors.textSecondary }]}>{record.private_notes}</Text>
                          </>
                        )}
                      </View>
                    </View>
                  )
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentMaxWidth}>
        
        <View style={styles.crmHeader}>
          <View style={styles.searchContainer}>
            <Search size={20} color={Colors.textSecondary} style={styles.searchIcon} />
            <TextInput style={styles.searchInput} placeholder="Search by name or phone..." placeholderTextColor={Colors.textSecondary} value={searchQuery} onChangeText={setSearchQuery} />
          </View>

          <TouchableOpacity style={styles.addPatientBtn} onPress={() => setShowAddPatientModal(true)} activeOpacity={0.8}>
            <Plus size={18} color="#FFF" />
            <Text style={styles.addPatientText}>Add Patient</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
        ) : filteredPatients.length === 0 ? (
          <View style={styles.emptyState}>
            <User size={48} color="#D1D5DB" style={{ marginBottom: 16 }} />
            <Text style={styles.emptyStateText}>No patients found.</Text>
          </View>
        ) : (
          <FlatList data={filteredPatients} keyExtractor={item => item.id} renderItem={renderPatientCard} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false} />
        )}
      </View>

      {/* --- ADD NEW PATIENT MODAL --- */}
      <Modal visible={showAddPatientModal} transparent={true} animationType="fade">
        <KeyboardAvoidingView style={styles.modalOverlayCenter} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalContentSmall}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Patient</Text>
              <TouchableOpacity onPress={() => setShowAddPatientModal(false)} style={styles.closeBtn}>
                <X size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}><User size={16} color={Colors.textPrimary} style={{ marginRight: 6 }} /> Full Name *</Text>
              <TextInput style={styles.input} placeholder="e.g., Jane Doe" value={newPatientName} onChangeText={setNewPatientName} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}><Phone size={16} color={Colors.textPrimary} style={{ marginRight: 6 }} /> Phone Number *</Text>
              <TextInput style={styles.input} placeholder="e.g., 9876543210" value={newPatientPhone} onChangeText={setNewPatientPhone} keyboardType="phone-pad" maxLength={10} />
            </View>

            <TouchableOpacity style={[styles.saveBtn, savingPatient && styles.saveBtnDisabled]} onPress={handleAddPatient} disabled={savingPatient}>
              {savingPatient ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Save Patient</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* --- ADD TREATMENT RECORD MODAL --- */}
      <Modal visible={showRecordModal} transparent={true} animationType="slide">
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Treatment Record</Text>
              <TouchableOpacity onPress={() => setShowRecordModal(false)} style={styles.closeBtn}>
                <X size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>Patient: {selectedPatientForRecord?.full_name}</Text>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScrollContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}><Activity size={16} color={Colors.textPrimary} style={{ marginRight: 6 }} /> Issue Presented *</Text>
                <TextInput style={[styles.input, styles.textArea]} placeholder="e.g., Lower back pain..." value={issue} onChangeText={setIssue} multiline numberOfLines={3} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}><FileText size={16} color={Colors.textPrimary} style={{ marginRight: 6 }} /> Treatment Given *</Text>
                <TextInput style={[styles.input, styles.textArea]} placeholder="e.g., Acupuncture on GB20..." value={treatment} onChangeText={setTreatment} multiline numberOfLines={3} />
              </View>

              {/* NEW: Prescription Input Block */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}><ClipboardList size={16} color="#059669" style={{ marginRight: 6 }} /> Patient Prescription / Home Care</Text>
                <Text style={{ fontSize: 13, color: Colors.textSecondary, marginBottom: 8 }}>This will be visible to the patient on their profile.</Text>
                <TextInput 
                  style={[styles.input, styles.textArea, { borderColor: '#059669', borderWidth: 1.5 }]} 
                  placeholder="e.g., Massage LI4 for 5 mins daily. Avoid cold drinks..." 
                  value={prescription} 
                  onChangeText={setPrescription} 
                  multiline 
                  numberOfLines={4} 
                />
              </View>

              <View style={styles.imageUploadGroup}>
                <Text style={styles.label}><ImageIcon size={16} color={Colors.textPrimary} style={{ marginRight: 6 }} /> Photos of Condition (Max 5)</Text>
                
                {recordImages.length > 0 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                    {recordImages.map((img, index) => (
                      <View key={index} style={styles.uploadedImageWrapper}>
                         <Image source={{ uri: img.uri }} style={styles.uploadedImagePreview} />
                         <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeImage(index)}>
                            <X size={16} color={Colors.textSecondary} />
                         </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                )}

                {recordImages.length < 5 && (
                  <TouchableOpacity style={styles.pickImageBtn} onPress={handlePickImage} activeOpacity={0.8}>
                     <ImageIcon size={32} color={Colors.primary} style={{ marginBottom: 12 }} />
                     <Text style={styles.pickImageBtnText}>Snap or Upload Photo ({recordImages.length}/5)</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}><ClipboardList size={16} color={Colors.textPrimary} style={{ marginRight: 6 }} /> Private Notes (Optional)</Text>
                <TextInput style={[styles.input, styles.textArea]} placeholder="Internal notes..." value={notes} onChangeText={setNotes} multiline numberOfLines={3} />
              </View>
            </ScrollView>

            <TouchableOpacity style={[styles.saveBtn, savingRecord && styles.saveBtnDisabled]} onPress={handleSaveRecord} disabled={savingRecord}>
              {savingRecord ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Save Record</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* --- FULL SCREEN IMAGE VIEWER MODAL --- */}
      <Modal visible={!!fullScreenImage} transparent={true} animationType="fade">
        <View style={styles.fullScreenOverlay}>
          <TouchableOpacity 
            style={styles.fullScreenCloseBtn} 
            onPress={() => setFullScreenImage(null)}
          >
            <X size={32} color="#FFF" />
          </TouchableOpacity>
          
          {fullScreenImage && (
            <Image 
              source={{ uri: fullScreenImage }} 
              style={styles.fullScreenImage} 
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 20 },
  contentMaxWidth: { maxWidth: 800, width: '100%', alignSelf: 'center', flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  crmHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 16 },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 12, paddingHorizontal: 16, height: 50, borderWidth: 1, borderColor: '#EAEAEA' },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: Colors.textPrimary, ...(Platform.OS === 'web' && { outlineStyle: 'none' } as any) },
  
  addPatientBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, height: 50, paddingHorizontal: 20, borderRadius: 12, gap: 8 },
  addPatientText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },

  listContent: { paddingBottom: 40 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  emptyStateText: { fontSize: 18, color: Colors.textSecondary, fontWeight: '500' },

  card: { backgroundColor: Colors.surface, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#EAEAEA', overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: Colors.surface },
  avatarCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#EBF0E6', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: Colors.primary },
  patientInfo: { flex: 1 },
  patientName: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 4 },
  contactRow: { flexDirection: 'row', alignItems: 'center' },
  contactText: { fontSize: 14, color: Colors.textSecondary, marginLeft: 6 },
  bullet: { fontSize: 14, color: '#D1D5DB', marginHorizontal: 8 },
  
  expandedContent: { backgroundColor: '#FAFAF5', padding: 16, borderTopWidth: 1, borderTopColor: '#EAEAEA' },
  actionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  historyTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary },
  addRecordBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, gap: 6 },
  addRecordText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  
  emptyRecords: { alignItems: 'center', padding: 20, backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#F0F0F0', borderStyle: 'dashed' },
  emptyRecordsText: { color: Colors.textSecondary, fontSize: 14 },
  
  tableContainer: { backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#EAEAEA', overflow: 'hidden' },
  tableRow: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  dateCol: { width: 100, borderRightWidth: 1, borderRightColor: '#F0F0F0', paddingRight: 12, marginRight: 12, alignItems: 'flex-start' },
  dateText: { fontSize: 13, fontWeight: 'bold', color: Colors.textPrimary },
  timeText: { fontSize: 11, color: Colors.textSecondary, marginTop: 4, fontWeight: '500' },

  detailsCol: { flex: 1 },
  intakeBadge: { color: '#059669', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  
  recordLabel: { fontSize: 12, fontWeight: 'bold', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  recordValue: { fontSize: 15, color: Colors.textPrimary, lineHeight: 22 },

  // NEW: Prescription Highlight Styles
  prescriptionBox: { backgroundColor: '#DEF7EC', padding: 10, borderRadius: 8, marginTop: 10, borderWidth: 1, borderColor: '#A7F3D0' },
  prescriptionLabel: { fontSize: 12, fontWeight: 'bold', color: '#047857', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  prescriptionValue: { fontSize: 15, color: '#065F46', fontWeight: '500', lineHeight: 22 },

  historyImageWrapper: { marginTop: 8 },
  historyImageThumbnail: { width: 100, height: 100, borderRadius: 8, borderWidth: 1, borderColor: '#F0F0F0', marginRight: 10 },

  modalOverlayCenter: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContentSmall: { backgroundColor: Colors.surface, borderRadius: 24, padding: 24, width: '100%', maxWidth: 500, alignSelf: 'center', ...Platform.select({ web: { boxShadow: '0 10px 30px rgba(0,0,0,0.2)' } }) },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%', width: '100%', maxWidth: 800, alignSelf: 'center' },
  
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: Colors.textPrimary },
  closeBtn: { padding: 4 },
  modalSubtitle: { fontSize: 16, color: Colors.primary, fontWeight: '600', marginBottom: 24 },
  
  modalScrollContent: { paddingBottom: 20 },
  inputGroup: { marginBottom: 20 },
  label: { flexDirection: 'row', alignItems: 'center', fontSize: 15, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 8 },
  input: { backgroundColor: '#FAFAF5', borderWidth: 1, borderColor: '#EAEAEA', borderRadius: 12, padding: 16, fontSize: 16, color: Colors.textPrimary, ...(Platform.OS === 'web' && { outlineStyle: 'none' } as any) },
  textArea: { height: 100, textAlignVertical: 'top' },
  
  imageUploadGroup: { marginBottom: 20 },
  pickImageBtn: { backgroundColor: '#FAFAF5', borderWidth: 1, borderStyle: 'dashed', borderColor: Colors.primary, borderRadius: 16, padding: 24, alignItems: 'center', justifyContent: 'center' },
  pickImageBtnText: { color: Colors.primary, fontSize: 14, fontWeight: '600' },
  uploadedImageWrapper: { position: 'relative', width: 120, height: 120, marginRight: 12 },
  uploadedImagePreview: { width: '100%', height: '100%', borderRadius: 12, borderWidth: 1, borderColor: '#EAEAEA' },
  removeImageBtn: { position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(255,255,255,0.9)', padding: 4, borderRadius: 12 },

  saveBtn: { backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  saveBtnDisabled: { backgroundColor: '#9CA3AF' },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

  fullScreenOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', alignItems: 'center' },
  fullScreenCloseBtn: { position: 'absolute', top: 40, right: 20, zIndex: 10, padding: 12, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 25 },
  fullScreenImage: { width: '100%', height: '80%' },
});