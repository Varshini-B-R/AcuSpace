import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { usePathname, useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import React from 'react';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../lib/AuthContext';

import {
  AlertTriangle, ArrowLeft,
  CalendarClock,
  Code, Heart, Home, Info,
  LogOut,
  Mail, Menu,
  Network,
  Search,
  Settings,
  User,
  Users, Wrench
} from 'lucide-react-native';

// --- COMPLETELY RESPONSIVE CUSTOM SIDEBAR ---
function CustomDrawerContent(props: any) {
  const { session, signOut } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets(); // Grabs exact notch/status bar height

  // Hybrid Web/Mobile Logout with Confirmation
  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm("Are you sure you want to log out?");
      if (confirmed) {
        signOut().then(() => {
          window.location.replace('/'); 
        }).catch((error: any) => {
          console.error("Logout Error:", error.message);
          window.alert("There was an issue logging you out.");
        });
      }
    } else {
      Alert.alert("Sign Out", "Are you sure you want to log out?", [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Log Out", 
          style: "destructive", 
          onPress: async () => { 
            try {
              await signOut(); 
              router.replace('/'); 
            } catch (error: any) {
              console.error("Logout Error:", error.message);
              Alert.alert("Logout Failed", "There was an issue logging you out.");
            }
          } 
        }
      ]);
    }
  };

  return (
    <View style={styles.drawerContainer}>
      
      {/* TOP SECTION: Dynamic Profile/Login Link */}
      <TouchableOpacity 
        style={[
          styles.drawerProfileHeader, 
          { 
            paddingTop: Math.max(insets.top + 20, 40), 
            paddingBottom: 40 
          }
        ]} 
        activeOpacity={0.8}
        onPress={() => {
          if (session) {
            router.push('/profile');
          } else {
            router.push('/login');
          }
        }}
      >
        <View style={styles.drawerAvatar}>
          <User size={28} color={Colors.surface} />
        </View>
        <View style={styles.drawerHeaderText}>
          <Text style={styles.greetingText} numberOfLines={1}>
            {session ? 'Hey, Explorer!' : 'Welcome to AcuSpace'}
          </Text>
          <Text style={styles.subGreetingText} numberOfLines={1}>
            {session ? 'View your profile' : 'Tap to log in or sign up'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* MIDDLE SECTION: Standard Links */}
      <DrawerContentScrollView 
        {...props} 
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 20 }} 
        showsVerticalScrollIndicator={false}
      >
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* BOTTOM SECTION: Sticky Logout Button */}
      <View style={[styles.drawerFooter, { paddingBottom: Math.max(insets.bottom + 20, 20) }]}>
        <TouchableOpacity 
          style={[styles.logoutBtn, !session && styles.logoutBtnDisabled]} 
          onPress={handleLogout}
          disabled={!session}
          activeOpacity={0.8}
        >
          <LogOut size={20} color={session ? "#EF4444" : "#A1A1AA"} />
          <Text style={[styles.logoutText, !session && styles.logoutTextDisabled]}>
            Log Out
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function DrawerLayout() {
  const router = useRouter();
  const pathname = usePathname(); 
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;
  const isHome = pathname === '/';
  const { userRole } = useAuth(); 

  const handleBackPress = () => {
    if (pathname === '/book-appointment') router.navigate('/therapists');
    else router.back();
  };

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        headerStyle: { backgroundColor: Colors.background }, 
        headerTintColor: Colors.primary, 
        headerTitleStyle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary },
        headerShadowVisible: false, 
        drawerActiveTintColor: '#FFF', 
        drawerActiveBackgroundColor: Colors.primary, 
        drawerInactiveTintColor: Colors.textSecondary, 
        drawerLabelStyle: { fontSize: 16, fontWeight: '500', marginLeft: 10 }, 
        
        headerLeft: () => (
          <View style={{ marginLeft: 16 }}>
            {!isHome && (
              <TouchableOpacity onPress={handleBackPress} style={{ padding: 8 }}>
                <ArrowLeft size={26} color={Colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        ),
        
        headerRight: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
            {isDesktop && (
              <View style={styles.desktopNav}>
                <TouchableOpacity onPress={() => router.navigate('/')} style={styles.navTab}>
                  <Text style={[styles.navTabText, pathname === '/' && styles.activeTabText]}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.navigate('/symptoms')} style={styles.navTab}>
                  <Text style={[styles.navTabText, pathname === '/symptoms' && styles.activeTabText]}>Symptoms</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.navigate('/meridians')} style={styles.navTab}>
                  <Text style={[styles.navTabText, pathname === '/meridians' && styles.activeTabText]}>Meridians</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.navigate('/tools')} style={styles.navTab}>
                  <Text style={[styles.navTabText, pathname === '/tools' && styles.activeTabText]}>Tools</Text>
                </TouchableOpacity>
              </View>
            )}
            {!isDesktop && !isHome && (
              <TouchableOpacity onPress={() => router.navigate('/')} style={{ padding: 8, marginRight: 5 }}>
                <Home size={24} color={Colors.primary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={{ padding: 8 }}>
              <Menu size={30} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        ),
      })}
    >
      {/* --- ALL SCREENS MUST BE INSIDE THE <Drawer> TAG --- */}
      
     {/* --- HIDDEN SYSTEM SCREENS --- */}
     <Drawer.Screen name="index" options={{ drawerItemStyle: { display: 'none' }, title: 'Home', headerTitle: 'AcuSpace' }} />
      <Drawer.Screen name="profile" options={{ drawerItemStyle: { display: 'none' }, title: 'Profile', headerTitle: 'Profile' }} />
      <Drawer.Screen name="book-appointment" options={{ drawerItemStyle: { display: 'none' }, title: 'Book Session', headerTitle: 'Book Appointment' }} />
      <Drawer.Screen name="symptom/[id]" options={{ drawerItemStyle: { display: 'none' }, title: 'Point Guide', headerTitle: 'Treatment Guide' }} />
      <Drawer.Screen name="reviews" options={{ drawerItemStyle: { display: 'none' }, title: 'Patient Reviews', headerTitle: 'Reviews' }} />
      <Drawer.Screen name="appointments" options={{ drawerItemStyle: { display: 'none' } }} />
      <Drawer.Screen name="video-call" options={{ drawerItemStyle: { display: 'none' }, title: 'Video Room', headerTitle: 'Video Room' }} />
      {/* Remove the old therapist-dashboard */}

      {/* --- SHARED SCREENS (Visible to Everyone) --- */}
      <Drawer.Screen name="about" options={{ title: 'About AcuSpace', headerTitle: 'About Us', drawerIcon: ({ color, size }) => <Info size={size} color={color} /> }} />
      <Drawer.Screen name="contact" options={{ title: 'Contact Support', headerTitle: 'Contact Us', drawerIcon: ({ color, size }) => <Mail size={size} color={color} /> }} />
      
      {/* As requested: Meridians and Tools visible to both roles */}
      <Drawer.Screen name="meridians" options={{ title: 'Meridian Pathways', headerTitle: 'Meridians', drawerIcon: ({ color, size }) => <Network size={size} color={color} /> }} />
      <Drawer.Screen name="tools" options={{ title: 'Shop Tools', headerTitle: 'AcuSpace Shop', drawerIcon: ({ color, size }) => <Wrench size={size} color={color} /> }} />

      {/* --- PATIENT ONLY SCREENS --- */}
      <Drawer.Screen name="favorites" options={{ title: 'My Favorites', headerTitle: 'Saved Points', drawerIcon: ({ color, size }) => <Heart size={size} color={color} />, drawerItemStyle: userRole === 'therapist' ? { display: 'none' } : {} }} />
      <Drawer.Screen name="symptoms" options={{ title: 'Search your Symptom', headerTitle: 'Find Relief', drawerIcon: ({ color, size }) => <Search size={size} color={color} />, drawerItemStyle: userRole === 'therapist' ? { display: 'none' } : {} }} />
      <Drawer.Screen name="therapists" options={{ title: 'Find a Therapist', headerTitle: 'Our Practitioners', drawerIcon: ({ color, size }) => <Users size={size} color={color} />, drawerItemStyle: userRole === 'therapist' ? { display: 'none' } : {} }} />

      {/* --- THERAPIST ONLY SCREENS (NEW) --- */}
      <Drawer.Screen name="patients" options={{ title: 'Patients (CRM)', headerTitle: 'Patient Records', drawerIcon: ({ color, size }) => <Users size={size} color={color} />, drawerItemStyle: userRole !== 'therapist' ? { display: 'none' } : {} }} />
      <Drawer.Screen name="schedule" options={{ title: 'Manage Schedule', headerTitle: 'My Schedule', drawerIcon: ({ color, size }) => <CalendarClock size={size} color={color} />, drawerItemStyle: userRole !== 'therapist' ? { display: 'none' } : {} }} />

      {/* --- UTILITIES --- */}
      <Drawer.Screen name="settings" options={{ title: 'Settings', headerTitle: 'App Settings', drawerIcon: ({ color, size }) => <Settings size={size} color={color} /> }} />
      <Drawer.Screen name="developer" options={{ title: 'Developer', headerTitle: 'Developer Tools', drawerIcon: ({ color, size }) => <Code size={size} color={color} /> }} />
      <Drawer.Screen name="disclaimer" options={{ title: 'Disclaimer', headerTitle: 'Medical Disclaimer', drawerIcon: ({ color, size }) => <AlertTriangle size={size} color={color} /> }} />


    </Drawer>
  );
}

const styles = StyleSheet.create({
  desktopNav: { flexDirection: 'row', alignItems: 'center', marginRight: 15, gap: 15 },
  navTab: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  navTabText: { fontSize: 16, fontWeight: '600', color: Colors.textSecondary, transitionDuration: '0.2s' as any },
  activeTabText: { color: Colors.primary, fontWeight: '700' },
  
  // --- STRUCTURAL DRAWER STYLES ---
  drawerContainer: { flex: 1, backgroundColor: Colors.surface },
  
  drawerProfileHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    backgroundColor: Colors.primary,
    width: '100%' 
  },
  drawerAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  drawerHeaderText: { flex: 1, justifyContent: 'center' },
  greetingText: { fontSize: 18, fontWeight: 'bold', color: Colors.surface, marginBottom: 4, flexShrink: 1 },
  subGreetingText: { fontSize: 13, color: 'rgba(255,255,255,0.8)', flexShrink: 1 },
  
  drawerFooter: { paddingHorizontal: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#EAEAEA', backgroundColor: Colors.surface },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 14, borderRadius: 12, backgroundColor: '#FEF2F2' },
  logoutBtnDisabled: { backgroundColor: '#F3F4F6' },
  logoutText: { fontSize: 16, fontWeight: '600', color: '#EF4444' },
  logoutTextDisabled: { color: '#A1A1AA' }
});