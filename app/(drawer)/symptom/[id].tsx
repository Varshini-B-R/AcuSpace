import { useLocalSearchParams, useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Colors } from '../../../constants/Colors';
import { SYMPTOM_DATA } from '../../../data/symptomsData';

// --- NEW: Web-Safe SVG Icons ---
import { ArrowLeft, Hand, Heart, Home, Stethoscope, XCircle } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function SymptomDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [modalVisible, setModalVisible] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  const openImage = () => {
    setModalVisible(true);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const closeImage = () => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
  };

  const symptomData = SYMPTOM_DATA.find(item => item.id === id);

  if (!symptomData) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Symptom not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: Colors.primary || '#7D8B55' }]}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      
      <Drawer.Screen 
        options={{
          title: 'Point Guide', 
          headerStyle: { backgroundColor: '#FAFAF5' }, 
          headerTintColor: Colors.primary || '#7D8B55', 
          headerTitleStyle: { fontSize: 18, fontWeight: 'bold' }, 
          headerShadowVisible: false, 
          
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={{ marginLeft: 16, padding: 4 }} 
            >
              {/* Replaced Ionicons arrow-back with SVG ArrowLeft */}
              <ArrowLeft size={28} color={Colors.primary || '#7D8B55'} />
            </TouchableOpacity>
          ),

          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: 15, paddingRight: 16 }}>
              <TouchableOpacity style={{ padding: 4 }}>
                {/* Replaced Ionicons heart-outline with SVG Heart */}
                <Heart size={24} color={Colors.primary || '#7D8B55'} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.navigate('/')} style={{ padding: 4 }}>
                {/* Replaced Ionicons home-outline with SVG Home */}
                <Home size={24} color={Colors.primary || '#7D8B55'} />
              </TouchableOpacity>
            </View>
          ),
        }} 
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.topSection}>
          <View style={[styles.badgeContainer, { backgroundColor: Colors.primary || '#7D8B55' }]}>
            <Text style={styles.badgeText}>{symptomData.points}</Text>
          </View>
          <Text style={styles.mainTitle}>{symptomData.symptom}</Text>
        </View>

        <TouchableOpacity onPress={openImage} activeOpacity={0.9} style={styles.imageCardShadowWrapper}>
          <View style={styles.imageCard}>
            <Image 
              source={symptomData.diagramUrl}   
              style={styles.diagramImage} 
              resizeMode="contain" 
            />
            <View style={styles.imageOverlay}>
              <Text style={styles.imageCaption}>Tap to enlarge diagram</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            {/* Replaced Ionicons medkit with SVG Stethoscope */}
            <Stethoscope size={22} color={Colors.primary || '#7D8B55'} />
            <Text style={styles.cardTitle}>Treatment Protocol</Text>
          </View>
          <Text style={styles.cardText}>{symptomData.description}</Text>
        </View>
        
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            {/* Replaced Ionicons hand-right with SVG Hand */}
            <Hand size={22} color={Colors.primary || '#7D8B55'} />
            <Text style={styles.cardTitle}>How to Apply Pressure</Text>
          </View>
          <Text style={styles.cardText}>
            Apply steady, firm pressure to the points for 1-2 minutes. Breathe deeply and massage the area in small circular motions. Release if you feel sharp pain.
          </Text>
        </View>

      </ScrollView>

      {/* FULLSCREEN MODAL */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeBtn} onPress={closeImage}>
            {/* Replaced Ionicons close-circle with SVG XCircle */}
            <XCircle size={36} color="#FFF" />
          </TouchableOpacity>

          <Animated.Image
            source={symptomData.diagramUrl}  
            style={[
              styles.fullImage,
              { transform: [{ scale: scaleAnim }] },
            ]}
            resizeMode="contain"
          />
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF5' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  topSection: { alignItems: 'center', marginBottom: 25 },
  
  badgeContainer: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, marginBottom: 12 },
  badgeText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  mainTitle: { fontSize: 26, fontWeight: 'bold', color: '#2C3E50', textAlign: 'center' }, 
  
  imageCardShadowWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 25,
  },
  imageCard: { 
    width: '100%', 
    height: 260, 
    backgroundColor: '#FFF', 
    borderRadius: 16, 
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0'
  },
  diagramImage: { width: '100%', height: '100%' },
  
  imageOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(44, 62, 80, 0.7)', paddingVertical: 10, alignItems: 'center' },
  imageCaption: { color: '#FFF', fontSize: 13, fontWeight: '600', letterSpacing: 0.5 },
  
  card: { 
    backgroundColor: '#FFF', 
    borderRadius: 16, 
    padding: 20, 
    marginBottom: 16, 
    borderWidth: 1, 
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#2C3E50', marginLeft: 10 },
  cardText: { fontSize: 15, color: '#555', lineHeight: 24 },
  
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAF5' },
  errorText: { fontSize: 18, color: '#e74c3c', marginBottom: 20, fontWeight: '600' },
  backBtn: { padding: 14, borderRadius: 12, paddingHorizontal: 24 },
  backBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },

  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(20, 30, 40, 0.95)', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: width,
    height: height * 0.8,
  },
  closeBtn: {
    position: 'absolute',
    top: 60, 
    right: 20,
    zIndex: 10,
    padding: 10,
  },
});