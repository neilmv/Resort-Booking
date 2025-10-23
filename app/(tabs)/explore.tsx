import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { api, API_URL } from '../../utils/api';

interface Resort {
  id: string;
  name: string;
  description: string;
  location: string;
  price_per_night: number;
  rating: number;
  image_url: string;
  amenities: string[];
  available_rooms: number;
}

export default function ExploreScreen() {
  const [resorts, setResorts] = useState<Resort[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredResorts, setFilteredResorts] = useState<Resort[]>([]);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    loadResorts();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = resorts.filter(resort =>
        resort.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resort.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredResorts(filtered);
    } else {
      setFilteredResorts(resorts);
    }
  }, [searchQuery, resorts]);

  const loadResorts = async () => {
    try {
      const data = await api.getResorts();
      setResorts(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load resorts');
    }
  };

  const handleResortPress = (resort: Resort) => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to view resort details', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => router.push('/login') }
      ]);
      return;
    }
    router.push(`/modal?id=${resort.id}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search resorts or locations..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>
          {searchQuery ? 'Search Results' : 'All Resorts'}
        </Text>

        {filteredResorts.map((resort) => (
          <TouchableOpacity
            key={resort.id}
            style={styles.resortCard}
            onPress={() => handleResortPress(resort)}
          >
            <Image source={{ uri: `${API_URL}${resort.image_url}` }} style={styles.resortImage} />
            <View style={styles.resortDetails}>
              <View style={styles.resortHeader}>
                <Text style={styles.resortName}>{resort.name}</Text>
                <View style={styles.rating}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.ratingText}>{resort.rating}</Text>
                </View>
              </View>
              <Text style={styles.resortLocation}>
                <Ionicons name="location-outline" size={14} color="#666" />
                {resort.location}
              </Text>
              <Text style={styles.resortDescription} numberOfLines={2}>
                {resort.description}
              </Text>
              <View style={styles.amenities}>
                {resort.amenities.slice(0, 3).map((amenity, index) => (
                  <View key={index} style={styles.amenity}>
                    <Text style={styles.amenityText}>{amenity}</Text>
                  </View>
                ))}
                {resort.amenities.length > 3 && (
                  <View style={styles.amenity}>
                    <Text style={styles.amenityText}>+{resort.amenities.length - 3}</Text>
                  </View>
                )}
              </View>
              <View style={styles.resortFooter}>
                <Text style={styles.price}>${resort.price_per_night}/night</Text>
                <Text style={styles.availability}>
                  {resort.available_rooms > 0 ? `${resort.available_rooms} rooms left` : 'Sold Out'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: 60,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    margin: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  resortCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  resortImage: {
    width: '100%',
    height: 160,
  },
  resortDetails: {
    padding: 16,
  },
  resortHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  resortName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    color: '#FF385C',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  resortLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  resortDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  amenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  amenity: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  amenityText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  resortFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF385C',
  },
  availability: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});