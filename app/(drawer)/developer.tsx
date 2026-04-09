import React from 'react';
import { Alert, Dimensions, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AnimatedView from '../../components/AnimatedView'; 
import { Colors } from '../../constants/Colors';

// --- NEW: Web-Safe SVG Icons ---
import { Github, Linkedin, Globe, Mail, ChevronRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function DeveloperScreen() {
  
  const links = {
    github: 'https://github.com/Varshini-B-R',
    linkedin: 'https://www.linkedin.com/in/varshini-b-r-288a13316/', 
    email: 'mailto:varshinibr333@gmail.com', 
    portfolio: 'https://therapist-varshini.vercel.app' 
  };

  const handleEmailPress = async () => {
    try {
      const supported = await Linking.canOpenURL(links.email);
      if (supported) {
        await Linking.openURL(links.email);
      } else {
        Alert.alert(
          "No Email App Found", 
          "We couldn't find a default email app on this device. You can reach me directly at:\n\nvarshinibr333@gmail.com"
        );
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong trying to open your email app.");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      
      <AnimatedView delay={100}>
        <View style={styles.card}>
          
          {/* Top Banner Area */}
          <View style={styles.banner} />

          {/* Avatar floating over the banner */}
          <View style={styles.avatarContainer}>
             <Image 
               source={require('../../assets/images/varshini.jpg')} 
               style={styles.avatar} 
               defaultSource={{ uri: 'https://placehold.co/200x200/8A9A5B/FFFFFF/png?text=V' }}
             />
          </View>
          
          <View style={styles.infoSection}>
            <Text style={styles.name}>Varshini B R</Text>
            <Text style={styles.role}>Lead Developer & TCM Enthusiast</Text>
            
            <Text style={styles.bio}>
              Passionate about bridging the gap between ancient healing wisdom and modern technology. I built this application to make the complex world of Traditional Chinese Medicine intuitive, accessible, and beautiful for everyone.
            </Text>

            {/* Skills Badges */}
            <View style={styles.skillsContainer}>
              {['React Native', 'Expo', 'TypeScript', 'UI/UX Design'].map((skill, index) => (
                <View key={index} style={styles.skillBadge}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </AnimatedView>

      <AnimatedView delay={200}>
        <Text style={styles.sectionTitle}>Connect</Text>
        
        {/* Action Buttons styled like menu items */}
        <View style={styles.actionContainer}>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => Linking.openURL(links.github)} activeOpacity={0.7}>
            <View style={[styles.iconBox, { backgroundColor: '#333' }]}>
              {/* Replaced Ionicons with SVG Github */}
              <Github size={20} color="#FFF" />
            </View>
            <Text style={styles.actionText}>GitHub Profile</Text>
            {/* Replaced Ionicons with SVG ChevronRight */}
            <ChevronRight size={20} color="#CCC" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.actionButton} onPress={() => Linking.openURL(links.linkedin)} activeOpacity={0.7}>
            <View style={[styles.iconBox, { backgroundColor: '#0077B5' }]}>
              {/* Replaced Ionicons with SVG Linkedin */}
              <Linkedin size={20} color="#FFF" />
            </View>
            <Text style={styles.actionText}>LinkedIn</Text>
            <ChevronRight size={20} color="#CCC" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.actionButton} onPress={() => Linking.openURL(links.portfolio)} activeOpacity={0.7}>
            <View style={[styles.iconBox, { backgroundColor: Colors.primary }]}>
              {/* Replaced Ionicons with SVG Globe */}
              <Globe size={20} color="#FFF" />
            </View>
            <Text style={styles.actionText}>Portfolio Website</Text>
            <ChevronRight size={20} color="#CCC" />
          </TouchableOpacity>
          
          <View style={styles.divider} />

          <TouchableOpacity style={styles.actionButton} onPress={handleEmailPress} activeOpacity={0.7}>
            <View style={[styles.iconBox, { backgroundColor: Colors.accent }]}>
              {/* Replaced Ionicons with SVG Mail */}
              <Mail size={20} color="#FFF" />
            </View>
            <Text style={styles.actionText}>Send an Email</Text>
            <ChevronRight size={20} color="#CCC" />
          </TouchableOpacity>

        </View>
      </AnimatedView>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.background, 
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  
  card: { 
    backgroundColor: Colors.surface, 
    borderRadius: 20, 
    elevation: 4, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    overflow: 'hidden',
    marginBottom: 25,
  },
  banner: {
    height: 100,
    backgroundColor: Colors.primary,
    width: '100%',
  },
  avatarContainer: { 
    alignItems: 'center',
    marginTop: -50, 
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatar: { 
    width: 110, 
    height: 110, 
    borderRadius: 55, 
    borderWidth: 4, 
    borderColor: Colors.surface,
    backgroundColor: '#EBEBEB',
  },
  infoSection: {
    padding: 25,
    paddingTop: 15,
    alignItems: 'center',
  },
  name: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  role: { 
    fontSize: 15, 
    color: Colors.primary, 
    marginBottom: 20, 
    fontWeight: '600' 
  },
  bio: { 
    textAlign: 'center', 
    color: Colors.textSecondary, 
    lineHeight: 24, 
    fontSize: 15,
    marginBottom: 25,
  },
  
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  skillBadge: {
    backgroundColor: '#F2EBE1', 
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 15,
  },
  skillText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },

  sectionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: Colors.textPrimary, 
    marginBottom: 15,
    marginLeft: 5,
  },
  actionContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    paddingHorizontal: 5,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginLeft: 60, 
  }
});