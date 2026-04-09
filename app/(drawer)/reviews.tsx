import { ResizeMode, Video } from 'expo-av';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/Colors';

// --- NEW: Web-Safe SVG Icons ---
import { Star, Stethoscope } from 'lucide-react-native';

// --- VIDEO REVIEW DATA ---
const VIDEO_REVIEWS = [
  { 
    id: '1', 
    name: 'Sample Patient', 
    therapist: 'Subrahmanya H C', 
    caption: 'A wonderful healing experience.', 
    date: 'Oct 15, 2025',
    videoUrl: 'https://example.com/video.mp4' // This one has a video, so it will show
  },
  { 
    id: '2', 
    name: 'Rahul K.', 
    therapist: 'Varshini B R', 
    caption: 'Fire cupping worked wonders for my sports injuries and muscle tension! I highly recommend this clinic to anyone suffering from chronic back pain.', 
    date: 'Sep 22, 2025',
    videoUrl: '' // This one is blank, so the video box will completely disappear!
  },
];

export default function ReviewsScreen() {
  return (
    <View style={styles.mainContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Rating Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryRating}>4.9</Text>
          <View style={styles.summaryStars}>
            {/* Replaced Ionicons with SVG Star, using fill to keep them solid gold */}
            <Star size={24} color="#CBA153" fill="#CBA153" />
            <Star size={24} color="#CBA153" fill="#CBA153" />
            <Star size={24} color="#CBA153" fill="#CBA153" />
            <Star size={24} color="#CBA153" fill="#CBA153" />
            <Star size={24} color="#CBA153" fill="#CBA153" />
          </View>
          <Text style={styles.summaryText}>Based on 100+ Testimonials</Text>
        </View>

        <Text style={styles.sectionTitle}>Patient Stories</Text>
        
        {/* Video Feed */}
        {VIDEO_REVIEWS.map((review) => (
          <View key={review.id} style={styles.reviewCard}>
            
            <View style={styles.reviewHeader}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{review.name ? review.name.charAt(0) : '?'}</Text>
              </View>
              
              <View style={styles.reviewHeaderInfo}>
                <Text style={styles.reviewerName}>{review.name || 'Anonymous'}</Text>
                <Text style={styles.reviewDate}>{review.date}</Text>
              </View>
            </View>
            
            <View style={styles.therapistBadge}>
              {/* Replaced Ionicons medical-outline with SVG Stethoscope */}
              <Stethoscope size={14} color={Colors.primary} />
              <Text style={styles.therapistName}>Treated by {review.therapist}</Text>
            </View>

            <Text style={styles.reviewText}>{review.caption}</Text>

            {/* Conditional Rendering for the Video Player */}
            {review.videoUrl && review.videoUrl.trim() !== '' && (
              <View style={styles.videoContainer}>
                <Video
                  style={styles.videoPlayer}
                  source={{ uri: review.videoUrl }}
                  useNativeControls
                  resizeMode={ResizeMode.COVER}
                  isLooping={false}
                />
              </View>
            )}

          </View>
        ))}
        
        <View style={{ height: 40 }} /> 
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: 20 },
  
  summaryCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 25, alignItems: 'center', marginBottom: 25, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 },
  summaryRating: { fontSize: 48, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 5 },
  summaryStars: { flexDirection: 'row', gap: 4, marginBottom: 10 },
  summaryText: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },
  
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 15, marginLeft: 5 },
  
  reviewCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 20, marginBottom: 20, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  avatarCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surface, borderWidth: 1, borderColor: '#EAEAEA', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 16, fontWeight: 'bold', color: Colors.primary },
  reviewHeaderInfo: { flex: 1 },
  reviewerName: { fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary },
  reviewDate: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  
  therapistBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderWidth: 1, borderColor: '#EAEAEA', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, marginBottom: 12 },
  therapistName: { fontSize: 12, color: Colors.primary, fontWeight: '600', marginLeft: 5 },
  
  reviewText: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22, marginBottom: 15 },
  
  // Left explicit black for the video container background to act as letterboxing
  videoContainer: { borderRadius: 12, overflow: 'hidden', backgroundColor: '#000', width: '100%', marginTop: 5 },
  videoPlayer: { width: '100%', height: 220 },
});