import React, { useState } from 'react';
import { LayoutAnimation, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';
import { Colors } from '../../constants/Colors';

// --- NEW: Web-Safe SVG Icons ---
import { 
  SunMoon, 
  Zap, 
  Leaf, 
  Network, 
  User, 
  Ruler, 
  CircleDot, 
  Droplets, 
  PauseCircle, 
  Umbrella, 
  Wind, 
  Book, 
  ChevronUp, 
  ChevronDown 
} from 'lucide-react-native';

// Enable smooth accordion animations for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CORE_CONCEPTS = [
  { id: 'c1', term: 'Yin & Yang', definition: 'The concept of dual, opposing, but complementary forces in the body (e.g., hot/cold, active/resting). Health is achieved when these two forces are in perfect balance.', icon: 'contrast' },
  { id: 'c2', term: 'Qi (Vital Energy)', definition: 'The vital energy or life force that flows through your body\'s Meridians. TCM focuses on keeping this energy flowing smoothly without blockages.', icon: 'flash' },
  { id: 'c3', term: 'The 5 Elements', definition: 'Wood, Fire, Earth, Metal, and Water. In TCM, these represent different phases, organs, and emotional states that interact to keep your body in balance.', icon: 'leaf' },
  { id: 'c4', term: 'The Meridians', definition: 'Think of Meridians as an invisible highway system inside the body. Instead of cars, Qi travels along these specific pathways to connect your organs and extremities.', icon: 'git-network' },
];

const TERMINOLOGY = [
  { id: 't1', term: 'Location', definition: 'In AcuSpace, "Location" refers to the specific anatomical position on the human body, not a geographic place on a map. We use body landmarks to find these points.', icon: 'body-outline' },
  { id: 't2', term: 'Cun (Measurement)', definition: 'A traditional Chinese unit of length. One "Cun" is strictly proportional to the patient, roughly equating to the width of their own thumb at the knuckle.', icon: 'resize-outline' },
  { id: 't3', term: 'Acupoint', definition: 'Specific "stations" or gateways along the Meridian highways where Qi can be accessed, stimulated, and balanced.', icon: 'radio-button-on-outline' },
  { id: 't4', term: 'Shu Points', definition: 'Highly powerful points located below the elbows and knees. TCM compares the flow of energy here to water moving toward your core organs.', icon: 'water-outline' },
  { id: 't5', term: 'Stagnation', definition: 'When Qi or Blood stops moving smoothly like a traffic jam. It is usually felt as pain, tension, or a feeling of being stuck physically or emotionally.', icon: 'pause-circle-outline' },
  { id: 't6', term: 'Dampness', definition: 'Not literal water, but a feeling of heaviness or sluggishness in the body. Brain fog, swollen joints, or feeling worse in humid weather is called "Dampness."', icon: 'umbrella-outline' },
  { id: 't7', term: 'Wind', definition: 'A "Wind" symptom is one that comes on rapidly, moves around the body (like wandering joint pain), or causes tremors and spasms.', icon: 'cloudy-outline' },
];

export default function AboutScreen() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  // --- HELPER FUNCTION: Renders the correct Lucide Icon based on string name ---
  const renderIcon = (iconName: string, size: number, color: string) => {
    switch (iconName) {
      case 'contrast': return <SunMoon size={size} color={color} />;
      case 'flash': return <Zap size={size} color={color} />;
      case 'leaf': return <Leaf size={size} color={color} />;
      case 'git-network': return <Network size={size} color={color} />;
      case 'body-outline': return <User size={size} color={color} />;
      case 'resize-outline': return <Ruler size={size} color={color} />;
      case 'radio-button-on-outline': return <CircleDot size={size} color={color} />;
      case 'water-outline': return <Droplets size={size} color={color} />;
      case 'pause-circle-outline': return <PauseCircle size={size} color={color} />;
      case 'umbrella-outline': return <Umbrella size={size} color={color} />;
      case 'cloudy-outline': return <Wind size={size} color={color} />;
      default: return <Leaf size={size} color={color} />;
    }
  };

  // Helper component for rendering each accordion item
  const renderAccordionItem = (item: any) => {
    const isExpanded = expandedId === item.id;
    return (
      <TouchableOpacity 
        key={item.id}
        style={[styles.card, isExpanded && styles.cardExpanded]} 
        activeOpacity={0.8}
        onPress={() => toggleExpand(item.id)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.termContainer}>
            <View style={[styles.iconCircle, { backgroundColor: isExpanded ? Colors.primary : Colors.textSecondary }]}>
               {/* Replaced Ionicons with SVG helper */}
               {renderIcon(item.icon, 20, "#FFF")}
            </View>
            <Text style={[styles.termText, isExpanded && { color: Colors.primary }]}>{item.term}</Text>
          </View>
          
          {/* Replaced Chevron Ionicons with SVG Chevrons */}
          {isExpanded ? (
            <ChevronUp size={20} color={Colors.textSecondary} />
          ) : (
            <ChevronDown size={20} color={Colors.textSecondary} />
          )}
        </View>

        {isExpanded && (
          <View style={styles.definitionContainer}>
            <Text style={styles.definitionText}>{item.definition}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      
      {/* Header */}
      <View style={styles.header}>
        <Book size={48} color={Colors.primary} />
        <Text style={styles.title}>TCM Fundamentals</Text>
        <Text style={styles.subtitle}>Understanding the wisdom behind the healing.</Text>
      </View>

      {/* Intro Block */}
      <View style={styles.introBlock}>
        <Text style={styles.introTitle}>What is TCM?</Text>
        <Text style={styles.introText}>
          Traditional Chinese Medicine (TCM) is a holistic system of health that views the body as a miniature universe. Unlike Western medicine, which often treats isolated symptoms, TCM treats the <Text style={{fontWeight: 'bold'}}>root cause</Text> by balancing the body's energy.
        </Text>
      </View>

      {/* Core Concepts Section */}
      <Text style={styles.sectionTitle}>Core Concepts</Text>
      {CORE_CONCEPTS.map(renderAccordionItem)}

      {/* Terminology Section */}
      <Text style={[styles.sectionTitle, { marginTop: 25 }]}>Common Terminology & Symptoms</Text>
      {TERMINOLOGY.map(renderAccordionItem)}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Content curated by TCM Experts.</Text>
        <Text style={styles.footerText}>Version 1.0.0</Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: 20 },
  header: { alignItems: 'center', marginVertical: 30 },
  title: { fontSize: 26, fontWeight: 'bold', color: Colors.textPrimary, marginTop: 10 },
  subtitle: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', marginTop: 8 },
  
  introBlock: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  introTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 10 },
  introText: { fontSize: 15, color: Colors.textSecondary, lineHeight: 24 },

  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 15, marginLeft: 5 },
  
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginBottom: 12,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0', 
  },
  cardExpanded: {
    borderColor: Colors.primary,
    backgroundColor: '#FAFCFA', 
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  termContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  termText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    flexShrink: 1,
  },
  definitionContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
  },
  definitionText: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  
  footer: { marginTop: 40, alignItems: 'center' },
  footerText: { color: Colors.textSecondary, fontSize: 13, marginBottom: 4 },
});