import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { SYMPTOM_DATA } from '../../data/symptomsData';

// --- NEW: Web-Safe SVG Icons ---
import { Search, MessageSquare, User } from 'lucide-react-native';

export default function SymptomSearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const filteredSymptoms = SYMPTOM_DATA.filter((item) =>
    item.symptom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      {/* Replaced Ionicons search-outline with SVG Search */}
      <Search size={64} color={Colors.textSecondary} style={{ marginBottom: 15 }} />
      <Text style={styles.emptyTitle}>Symptom Not Found</Text>
      <Text style={styles.emptyText}>
        We don't have that specific symptom listed in our quick guide, but TCM treats a vast array of unique conditions.
      </Text>
      
      <TouchableOpacity 
        style={styles.contactButton} 
        activeOpacity={0.8}
        onPress={() => router.push('/(drawer)/contact')}
      >
        {/* Replaced Ionicons chatbubbles-outline with SVG MessageSquare */}
        <MessageSquare size={20} color="#FFF" style={{ marginRight: 8 }} />
        <Text style={styles.contactButtonText}>Consult a Therapist</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header & Search Bar UI */}
      <View style={styles.header}>
        <Text style={styles.title}>Symptom Relief</Text>
        <View style={styles.searchContainer}>
          {/* Replaced Ionicons search with SVG Search */}
          <Search size={20} color={Colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search symptoms (e.g., Headache)..."
            placeholderTextColor={Colors.textSecondary} 
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
            autoFocus={true} 
          />
        </View>
      </View>

      {/* Results List */}
      <FlatList
        data={filteredSymptoms}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false} 
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card} 
            activeOpacity={0.7}
            onPress={() => router.push(`/(drawer)/symptom/${item.id}`)}
          >
            <Text style={styles.symptomTitle}>{item.symptom}</Text>
            
            <View style={styles.pointContainer}>
              {/* Replaced Ionicons body-outline with SVG User */}
              <User size={16} color={Colors.primary} />
              <Text style={styles.pointsText}> Key Points: {item.points}</Text>
            </View>
            
            <Text style={styles.descriptionText}>{item.description}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.background 
  },
  header: { 
    padding: 20, 
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA'
  },
  title: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: Colors.textPrimary,
    marginBottom: 15
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F3F0', 
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 45,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
    flexGrow: 1 
  },
  
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  symptomTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  pointContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary, 
  },
  descriptionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22, 
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  contactButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    elevation: 3,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  contactButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});