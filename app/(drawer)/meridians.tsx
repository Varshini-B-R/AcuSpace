import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { meridiansData } from '../../data/meridians';
import type { Meridian } from '../../types/tcm';

// --- NEW: Web-Safe SVG Icons ---
import {
  Activity,
  ArrowDownCircle,
  ChevronRight,
  Compass,
  Droplets,
  Filter,
  Heart,
  HeartPulse,
  Layers,
  Leaf,
  SunMoon,
  TreePine,
  Utensils,
  Wind
} from 'lucide-react-native';

// --- UPDATED HELPER FUNCTION ---
// Maps every specific meridian to a unique, TCM-appropriate SVG icon
const renderMeridianIcon = (name: string, size: number, color: string) => {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('lung')) return <Wind size={size} color={color} />;
  if (lowerName.includes('large intestine')) return <ArrowDownCircle size={size} color={color} />; 
  if (lowerName.includes('stomach')) return <Utensils size={size} color={color} />;
  if (lowerName.includes('spleen')) return <Leaf size={size} color={color} />; 
  if (lowerName.includes('small intestine')) return <Filter size={size} color={color} />; 
  if (lowerName.includes('pericardium')) return <HeartPulse size={size} color={color} />; 
  if (lowerName.includes('heart')) return <Heart size={size} color={color} />;
  if (lowerName.includes('bladder') && !lowerName.includes('gall')) return <Droplets size={size} color={color} />;
  if (lowerName.includes('kidney')) return <Activity size={size} color={color} />; 
  if (lowerName.includes('triple') || lowerName.includes('sanjiao')) return <Layers size={size} color={color} />; 
  if (lowerName.includes('gallbladder')) return <Compass size={size} color={color} />; 
  if (lowerName.includes('liver')) return <TreePine size={size} color={color} />; 

  return <SunMoon size={size} color={color} />; 
};

function MeridianCard({
  item,
  onPress,
}: {
  item: Meridian;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.iconBox}>
        {/* Render the specific SVG icon for this meridian */}
        {renderMeridianIcon(item.name, 24, Colors.primary)}
      </View>

      <View style={styles.cardContent}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.badges}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.element}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {item.yinYang === 'yin' ? 'Yin' : 'Yang'}
              </Text>
            </View>
          </View>
        </View>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
      {/* Replaced Ionicons chevron-forward with SVG ChevronRight */}
      <ChevronRight
        size={20}
        color={Colors.textSecondary}
        style={styles.chevron}
      />
    </Pressable>
  );
}

export default function MeridiansScreen() {
  const router = useRouter();

  const handlePress = useCallback(
    (item: Meridian) => {
      router.push(`/meridian/${item.id}`);
    },
    [router]
  );

  const renderItem = useCallback(
    ({ item }: { item: Meridian }) => (
      <MeridianCard item={item} onPress={() => handlePress(item)} />
    ),
    [handlePress]
  );

  const keyExtractor = useCallback((item: Meridian) => item.id, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={meridiansData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.7, 
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#F0F8F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardContent: {
    flex: 1,
    marginRight: 8,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    flexShrink: 1,
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
    flexShrink: 0,
  },
  badge: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  chevron: {
    marginLeft: 4,
  },
});