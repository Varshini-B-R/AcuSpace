import { Stack, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { meridiansData } from '../../data/meridians';
import type { TCMPoint } from '../../types/tcm';

// --- NEW: Web-Safe SVG Icons ---
import { ArrowLeft, Home, Lock } from 'lucide-react-native';

// FIXED: Moved the router and navigation hooks inside the component where they belong!

function PointRow({
  point,
  onPress,
}: {
  point: TCMPoint;
  onPress: () => void;
}) {
  const keyBenefit = point.benefits[0]
    ? point.benefits[0].length > 60
      ? `${point.benefits[0].slice(0, 60)}…`
      : point.benefits[0]
    : '';

  return (
    <Pressable
      style={({ pressed }) => [styles.pointRow, pressed && styles.pointRowPressed]}
      onPress={onPress}
    >
      <View style={styles.codeBadge}>
        <Text style={styles.codeText}>{point.code}</Text>
      </View>
      <View style={styles.pointContent}>
        <Text style={styles.pointName} numberOfLines={1}>
          {point.name}
        </Text>
        {keyBenefit ? (
          <Text style={styles.pointBenefit} numberOfLines={1}>
            {keyBenefit}
          </Text>
        ) : null}
      </View>
      {point.isLocked ? (
        <Lock
          size={18}
          color={Colors.textSecondary}
          style={styles.lockIcon}
        />
      ) : null}
    </Pressable>
  );
}

export default function MeridianDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  // FIXED: Hooks are correctly placed inside the main function here
  const router = useRouter();
  const navigation = useNavigation(); 

  const meridian = useMemo(() => {
    if (!id) return null;
    return meridiansData.find((m) => m.id === id) ?? null;
  }, [id]);

  if (!meridian) {
    return (
      <>
        <Stack.Screen options={{ title: 'Details' }} />
        <View style={styles.container}>
          <View style={styles.notFoundContainer}>
            <Text style={styles.notFoundText}>Not Found</Text>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      {/* UPDATED: The new Appbar styling with Home and Back buttons! */}
      <Stack.Screen 
        options={{ 
          title: meridian.name,
          headerStyle: { backgroundColor: Colors.background }, 
          headerShadowVisible: false, 
          headerTintColor: Colors.primary,
          headerTitleStyle: { fontWeight: 'bold', fontSize: 20, color: Colors.textPrimary }, 
          
          // --- NEW: Explicitly rendering the back button on the left ---
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={{ marginRight: 15, padding: 4 }} 
            >
              <ArrowLeft size={28} color={Colors.primary} />
            </TouchableOpacity>
          ),

          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 5 }}>
              <TouchableOpacity onPress={() => router.replace('/(drawer)')} style={{ padding: 4 }}>
                <Home size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          ),
        }} 
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{meridian.name}</Text>
          <View style={styles.badges}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{meridian.element}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {/* Note: I used meridian.type based on the data file, but fallback to yinYang just in case */}
                {meridian.type || (meridian as any).yinYang}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionText}>{meridian.description}</Text>
        </View>

        <Text style={styles.pointsSectionTitle}>Points</Text>
        <View style={styles.pointsList}>
          {meridian.points.map((point) => (
            <PointRow
              key={point.code}
              point={point}
              onPress={() =>
                router.push({
                  pathname: '/meridian/point/[code]',
                  params: { code: point.code },
                })
              }
            />
          ))}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: 16, paddingBottom: 32 },
  notFoundContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notFoundText: { fontSize: 18, color: Colors.textSecondary },
  
  header: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.textPrimary, marginBottom: 10 },
  
  badges: { flexDirection: 'row', gap: 8 },
  badge: { backgroundColor: Colors.surface, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: '#EAEAEA' },
  badgeText: { fontSize: 13, fontWeight: 'bold', color: Colors.primary, textTransform: 'capitalize' },
  
  descriptionCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#F0F0F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  descriptionText: { fontSize: 15, color: Colors.textSecondary, lineHeight: 24 }, 
  
  pointsSectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  pointsList: {},
  
  pointRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 16, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#F0F0F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  pointRowPressed: { opacity: 0.7, backgroundColor: Colors.background }, 
  
  codeBadge: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  codeText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  
  pointContent: { flex: 1, minWidth: 0 },
  pointName: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  pointBenefit: { fontSize: 13, color: Colors.textSecondary },
  lockIcon: { marginLeft: 8 },
});