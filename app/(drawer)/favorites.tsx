import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { useUser } from '../../context/UserContext';
import { meridiansData } from '../../data/meridians';

// --- NEW: Web-Safe SVG Icons ---
import { HeartOff, ChevronRight } from 'lucide-react-native';

export default function FavoritesScreen() {
  const { favorites } = useUser();
  const router = useRouter();

  // 1. Flatten all points into one big list
  const allPoints = meridiansData.flatMap(m => m.points);
  
  // 2. Filter to find only the saved ones
  const savedPoints = allPoints.filter(p => favorites.includes(p.code));

  if (savedPoints.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        {/* Replaced Ionicons heart-dislike with SVG HeartOff */}
        <HeartOff size={80} color={Colors.textSecondary} />
        <Text style={styles.emptyText}>No favorites yet.</Text>
        <Text style={styles.emptySubtext}>Tap the heart icon on any point to save it here.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={savedPoints}
        keyExtractor={(item) => item.code}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false} 
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card}
            onPress={() => router.push(`/meridian/point/${item.code}`)}
            activeOpacity={0.8}
          >
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.code}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.desc} numberOfLines={1}>{item.benefits[0]}</Text>
            </View>
            {/* Replaced Ionicons chevron with SVG ChevronRight */}
            <ChevronRight size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, backgroundColor: Colors.background },
  emptyText: { fontSize: 20, fontWeight: 'bold', color: Colors.textPrimary, marginTop: 20 },
  emptySubtext: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', marginTop: 10, lineHeight: 22 },
  
  card: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: Colors.surface, 
    padding: 16, 
    borderRadius: 16, 
    marginBottom: 12, 
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2 
  },
  
  badge: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  badgeText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  
  info: { flex: 1 },
  name: { fontSize: 17, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 4 },
  
  desc: { fontSize: 14, color: Colors.textSecondary },
});