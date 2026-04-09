import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Image, Modal, PanResponder, Pressable, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native'; 
import ImageViewer from 'react-native-image-zoom-viewer';
import { Colors } from '../../../constants/Colors';
import { useUser } from '../../../context/UserContext';
import { meridiansData } from '../../../data/meridians';
import { TCMPoint } from '../../../types/tcm';

// --- NEW: Web-Safe SVG Icons ---
import { 
  ArrowLeft, 
  Heart, 
  Home, 
  ChevronLeft, 
  ChevronRight, 
  Maximize, 
  MapPin, 
  Star, 
  CheckCircle, 
  AlertTriangle, 
  XCircle 
} from 'lucide-react-native';

export default function PointDetailScreen() {
  const router = useRouter();
  const { code, source } = useLocalSearchParams<{ code: string, source?: string }>();
  const { toggleFavorite, isFavorite } = useUser();
  const isFav = isFavorite(code || '');

  const [isImageModalVisible, setImageModalVisible] = useState(false);

  let currentMeridian = null;
  let currentIndex = -1;
  let point: TCMPoint | undefined;

  for (const meridian of meridiansData) {
    const foundIndex = meridian.points.findIndex((p) => p.code === code);
    if (foundIndex !== -1) {
      currentMeridian = meridian;
      currentIndex = foundIndex;
      point = meridian.points[foundIndex];
      break;
    }
  }

  const hasPrev = currentMeridian && currentIndex > 0;
  const hasNext = currentMeridian && currentIndex < (currentMeridian.points.length - 1);

  const goToPrevPoint = () => {
    if (hasPrev) {
      const prevCode = currentMeridian.points[currentIndex - 1].code;
      router.replace(`/meridian/point/${prevCode}${source ? `?source=${source}` : ''}`);
    }
  };

  const goToNextPoint = () => {
    if (hasNext) {
      const nextCode = currentMeridian.points[currentIndex + 1].code;
      router.replace(`/meridian/point/${nextCode}${source ? `?source=${source}` : ''}`);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 30 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 50) {
          goToPrevPoint();
        } else if (gestureState.dx < -50) {
          goToNextPoint();
        }
      },
    })
  ).current;

  if (!point) {
    return (
      <View style={styles.center}>
        <Text style={{ color: Colors.textPrimary }}>Point not found.</Text>
      </View>
    );
  }

  const imageSource = point.imageUrl
    ? (typeof point.imageUrl === 'string' ? { uri: point.imageUrl } : point.imageUrl)
    : null;

  return (
    <View style={{ flex: 1, gap: 6, backgroundColor: Colors.background }} {...panResponder.panHandlers}>
      <Stack.Screen
        options={{
          title: `${point.code} Details`,
          headerStyle: { backgroundColor: Colors.background },
          headerShadowVisible: false,
          headerTintColor: Colors.primary,
          headerTitleStyle: { fontWeight: 'bold', fontSize: 20, color: Colors.textPrimary },
          
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => {
                if (source === 'home') {
                  router.navigate('/(drawer)'); 
                } else {
                  router.back(); 
                }
              }}
              style={{ marginRight: 15 }}
            >
              {/* Replaced Ionicons arrow-back with SVG ArrowLeft */}
              <ArrowLeft size={28} color={Colors.primary} />
            </TouchableOpacity>
          ),

          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15, marginRight: 15 }}>
              <TouchableOpacity onPress={() => toggleFavorite(point.code)}>
                {/* Replaced Ionicons heart with SVG Heart (using fill for active state) */}
                <Heart
                  size={26}
                  color={isFav ? "#E91E63" : Colors.primary}
                  fill={isFav ? "#E91E63" : "transparent"}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.replace('/(drawer)')}>
                {/* Replaced Ionicons home-outline with SVG Home */}
                <Home size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        <View style={styles.navigationRow}>
          <TouchableOpacity
            onPress={goToPrevPoint}
            disabled={!hasPrev}
            style={{ opacity: hasPrev ? 1 : 0.2, padding: 10 }}
          >
            {/* Replaced Ionicons chevron-back with SVG ChevronLeft */}
            <ChevronLeft size={32} color={Colors.primary} />
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <View style={styles.codeBadge}>
              <Text style={styles.codeText}>{point.code}</Text>
            </View>
            <Text style={styles.nameText}>{point.name}</Text>

            {point.shuPoint && (
              <View style={styles.shuBadge}>
                <Text style={styles.shuText}>{point.shuPoint} Point</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={goToNextPoint}
            disabled={!hasNext}
            style={{ opacity: hasNext ? 1 : 0.2, padding: 10 }}
          >
            {/* Replaced Ionicons chevron-forward with SVG ChevronRight */}
            <ChevronRight size={32} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {imageSource && (
          <Pressable 
            onPress={() => setImageModalVisible(true)}
            style={{ 
              width: '100%', 
              height: 350, 
              backgroundColor: Colors.surface, 
              borderRadius: 16, 
              overflow: 'hidden', 
              marginBottom: 20,
              justifyContent: 'center', 
              alignItems: 'center',
              borderWidth: 1, 
              borderColor: '#F0F0F0',
            }}
          >
            <Image 
              source={imageSource} 
              style={{ width: '100%', height: '100%', resizeMode: 'contain' }} 
              resizeMode="contain" 
            />
            <View style={styles.expandHint}>
              {/* Replaced Ionicons scan-outline with SVG Maximize */}
              <Maximize size={20} color="#FFF" />
            </View>
          </Pressable>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            {/* Replaced Ionicons location-outline with SVG MapPin */}
            <MapPin size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Location</Text>
          </View>
          <Text style={styles.text}>{point.locationText}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            {/* Replaced Ionicons star-outline with SVG Star */}
            <Star size={20} color="#CBA153" />
            <Text style={styles.sectionTitle}>Benefits</Text>
          </View>
          {point.benefits.map((benefit, index) => (
            <View key={index} style={styles.bulletRow}>
              {/* Replaced Ionicons checkmark-circle with SVG CheckCircle */}
              <CheckCircle size={16} color={Colors.primary} />
              <Text style={styles.bulletText}>{benefit}</Text>
            </View>
          ))}
        </View>

        {point.safetyNote && (
          <View style={styles.warningBox}>
            <View style={styles.sectionHeader}>
              {/* Replaced Ionicons warning-outline with SVG AlertTriangle */}
              <AlertTriangle size={20} color={Colors.accent} />
              <Text style={[styles.sectionTitle, { color: Colors.accent }]}>Safety Note</Text>
            </View>
            <Text style={styles.text}>{point.safetyNote}</Text>
          </View>
        )}

      </ScrollView>

      {/* --- UPDATED MODAL --- */}
      <Modal
        visible={isImageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <StatusBar hidden={isImageModalVisible} />

          {/* Close Button is universal for both Web and Mobile */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setImageModalVisible(false)}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            {/* Replaced Ionicons close-circle with SVG XCircle */}
            <XCircle size={36} color="#FFF" />
          </TouchableOpacity>

          {Platform.OS === 'web' ? (
            // WEB SAFE FALLBACK: Simple, responsive Image component
            <View style={styles.webImageWrapper}>
              <Image 
                source={imageSource} 
                style={{ width: '90%', height: '90%', resizeMode: 'contain' }} 
              />
            </View>
          ) : (
            // MOBILE: The original third-party viewer for pinch-to-zoom
            <ImageViewer
              imageUrls={[{ url: '', props: { source: imageSource } }]}
              enableSwipeDown={true}
              onSwipeDown={() => setImageModalVisible(false)}
              renderIndicator={() => <View />}
              renderHeader={() => <View />} // Handled globally above
              backgroundColor="rgba(10, 20, 30, 0.95)"
            />
          )}

        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1, paddingBottom: 40, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },

  navigationRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%', marginBottom: 25 },
  titleContainer: { alignItems: 'center', flex: 1 },
  codeBadge: { backgroundColor: Colors.primary, width: 66, height: 66, borderRadius: 33, justifyContent: 'center', alignItems: 'center', marginBottom: 12, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  codeText: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  nameText: { fontSize: 22, fontWeight: 'bold', color: Colors.textPrimary, textAlign: 'center', paddingHorizontal: 5 },
  
  shuBadge: { backgroundColor: Colors.surface, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 8, borderWidth: 1, borderColor: '#EAEAEA' },
  shuText: { color: Colors.primary, fontSize: 13, fontWeight: 'bold' },

  expandHint: { position: 'absolute', bottom: 20, right: 10, backgroundColor: 'rgba(44, 62, 80, 0.6)', padding: 8, borderRadius: 10 },

  section: { backgroundColor: Colors.surface, borderRadius: 16, padding: 20, marginBottom: 16, elevation: 2, borderWidth: 1, borderColor: '#F0F0F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary, marginLeft: 8 },
  text: { fontSize: 16, lineHeight: 24, color: Colors.textSecondary },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 10 },
  bulletText: { fontSize: 16, color: Colors.textSecondary, marginLeft: 10, flex: 1, lineHeight: 22 },
  
  warningBox: { backgroundColor: Colors.safetyBackground, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: Colors.accent, marginTop: 10, marginBottom: 16 },

  // --- NEW STYLES FOR WEB MODAL ---
  modalContainer: { flex: 1, backgroundColor: 'rgba(10, 20, 30, 0.95)' },
  webImageWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  closeButton: { position: 'absolute', top: Platform.OS === 'web' ? 20 : 50, right: 20, zIndex: 100, padding: 5 },
});