import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
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

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [resorts, setResorts] = useState<Resort[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadResorts = async () => {
    try {
      const data = await api.getResorts();
      setResorts(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load resorts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadResorts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadResorts();
  };

  const handleBookNow = (resort: Resort) => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to book a resort', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => router.push('/login') }
      ]);
      return;
    }
    router.push(`/modal?id=${resort.id}`);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FF385C', '#FF6B8B']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>
            {user ? `Welcome, ${user.name}!` : 'Find Your Perfect Getaway'}
          </Text>
          <Text style={styles.subtitle}>
            Discover luxury resorts worldwide
          </Text>
        </View>
        {user ? (
          <TouchableOpacity style={styles.profileButton} onPress={logout}>
            <Ionicons name="log-out-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/login')}>
            <Ionicons name="person-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        )}
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.sectionTitle}>Featured Resorts</Text>
        
        {resorts.map((resort) => (
          <TouchableOpacity
            key={resort.id}
            style={styles.resortCard}
            onPress={() => handleBookNow(resort)}
          >
            <Image source={{ uri: `${API_URL}${resort.image_url}` }} style={styles.resortImage} />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.imageOverlay}
            />
            <View style={styles.resortInfo}>
              <View style={styles.resortHeader}>
                <Text style={styles.resortName}>{resort.name}</Text>
                <View style={styles.rating}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.ratingText}>{resort.rating}</Text>
                </View>
              </View>
              <Text style={styles.resortLocation}>
                <Ionicons name="location-outline" size={14} color="#FFF" />
                {resort.location}
              </Text>
              <Text style={styles.resortDescription} numberOfLines={2}>
                {resort.description}
              </Text>
              <View style={styles.resortFooter}>
                <Text style={styles.price}>${resort.price_per_night}/night</Text>
                <TouchableOpacity
                  style={styles.bookButton}
                  onPress={() => handleBookNow(resort)}
                >
                  <Text style={styles.bookButtonText}>Book Now</Text>
                </TouchableOpacity>
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
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFF',
    opacity: 0.9,
  },
  profileButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
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
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  resortImage: {
    width: '100%',
    height: 200,
  },
  imageOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  resortInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  resortHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  resortName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    flex: 1,
    marginRight: 8,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  resortLocation: {
    fontSize: 14,
    color: '#FFF',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  resortDescription: {
    fontSize: 12,
    color: '#FFF',
    opacity: 0.9,
    marginBottom: 12,
    lineHeight: 16,
  },
  resortFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  bookButton: {
    backgroundColor: '#FF385C',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  bookButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});