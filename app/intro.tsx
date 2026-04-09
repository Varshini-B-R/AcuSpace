import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Animated, FlatList, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Colors } from '../constants/Colors';

// --- NEW: Web-Safe SVG Icons ---
import { Leaf, User, Hand, AlertTriangle, Square, CheckSquare } from 'lucide-react-native';

const SLIDES = [
  {
    id: '1',
    title: 'Welcome to AcuSpace',
    subtitle: 'Ancient Wisdom for Modern Healing',
    description: 'Discover the power of Energy Healing. Connect body, mind, and spirit through the art of natural healing.',
    icon: 'leaf',
  },
  {
    id: '2',
    title: 'Explore Meridians',
    subtitle: 'Map Your Energy',
    description: 'Visualize the 12 major energy pathways. Learn how Qi(energy) flows through your body and influences your health.',
    icon: 'body',
  },
  {
    id: '3',
    title: 'Find Relief',
    subtitle: 'Acupoints & Therapy',
    description: 'Locate specific pressure points to relieve pain, reduce stress, and boost your immune system naturally.',
    icon: 'hand',
  },
  {
    id: '4', 
    title: 'Medical Disclaimer',
    subtitle: 'Please Read Carefully',
    description: 'This application provides information on TCM for educational purposes only. It is NOT a substitute for professional medical advice, diagnosis, or treatment.',
    icon: 'warning',
    isDisclaimer: true,
  },
];

export default function IntroScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isChecked, setIsChecked] = useState(false); 
  
  const { width, height } = useWindowDimensions(); 
  
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleFinish = async () => {
    if (!isChecked) return; 
    
    try {
      await AsyncStorage.setItem('hasLaunched', 'true');
      router.replace('/(drawer)');
    } catch (error) {
      console.error("Error saving launch status", error);
      router.replace('/(drawer)');
    }
  };

  const scrollToNext = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < SLIDES.length) {
      slidesRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex); 
    }
  };

  // --- HELPER FUNCTION: Renders the correct Lucide Icon based on string name ---
  const renderSlideIcon = (iconName: string, isDisclaimer?: boolean) => {
    const color = isDisclaimer ? Colors.accent : Colors.primary;
    const size = 100;

    switch (iconName) {
      case 'leaf':
        return <Leaf size={size} color={color} />;
      case 'body':
        return <User size={size} color={color} />;
      case 'hand':
        // Rotated slightly to mimic the original Ionicons "hand-left" look
        return <View style={{ transform: [{ rotate: '-45deg' }] }}><Hand size={size} color={color} /></View>;
      case 'warning':
        return <AlertTriangle size={size} color={color} />;
      default:
        return <Leaf size={size} color={color} />;
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        style={{ flex: 1, width: '100%' }}
        data={SLIDES}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width, height: height * 0.75 }]}>
            <View style={[styles.iconContainer, item.isDisclaimer && { backgroundColor: Colors.safetyBackground }]}>
               {/* Render the new SVG Icon */}
               {renderSlideIcon(item.icon, item.isDisclaimer)}
            </View>
            <Text style={[styles.title, item.isDisclaimer && { color: Colors.accent }]}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
            <Text style={styles.description}>{item.description}</Text>
            
            {item.isDisclaimer && (
              <TouchableOpacity 
                style={styles.checkboxContainer} 
                activeOpacity={0.8}
                onPress={() => setIsChecked(!isChecked)}
              >
                {/* Checkbox Toggle using Lucide */}
                {isChecked ? (
                  <CheckSquare size={28} color={Colors.accent} />
                ) : (
                  <Square size={28} color={Colors.textSecondary} />
                )}
                
                <Text style={styles.checkboxText}>
                  I acknowledge that the creators are not responsible for any mishappenings using this app.
                </Text>
              </TouchableOpacity>
            )}

          </View>
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={slidesRef}
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />

      <View style={[styles.footer, { height: height * 0.25 }]}>
        <View style={styles.paginator}>
          {SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [10, 20, 10],
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            return <Animated.View style={[styles.dot, { width: dotWidth, opacity }]} key={i.toString()} />;
          })}
        </View>

        {currentIndex === SLIDES.length - 1 ? (
          <TouchableOpacity 
            style={[
              styles.button, 
              { backgroundColor: isChecked ? Colors.primary : '#CCC' }
            ]} 
            onPress={isChecked ? handleFinish : undefined}
            activeOpacity={isChecked ? 0.8 : 1}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.button, { backgroundColor: Colors.primary }]} onPress={scrollToNext} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  slide: { justifyContent: 'center', alignItems: 'center', padding: 20 },
  iconContainer: { 
    width: 200, height: 200, backgroundColor: Colors.surface, borderRadius: 100, 
    justifyContent: 'center', alignItems: 'center', marginBottom: 40, elevation: 10, shadowOpacity: 0.1 
  },
  title: { fontSize: 28, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 18, fontWeight: '600', color: Colors.primary, marginBottom: 20, textAlign: 'center' },
  description: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: 20, lineHeight: 24 },
  
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.safetyBackground,
    padding: 15,
    borderRadius: 12,
    marginTop: 30,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: Colors.accent
  },
  checkboxText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: Colors.accent,
    lineHeight: 20,
    fontWeight: '500'
  },

  footer: { justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 50, alignItems: 'center' },
  paginator: { flexDirection: 'row', height: 64, alignItems: 'center' },
  dot: { height: 10, borderRadius: 5, backgroundColor: Colors.primary, marginHorizontal: 8 },
  button: { paddingVertical: 15, paddingHorizontal: 40, borderRadius: 30, elevation: 5 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});