import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api, API_URL } from '../utils/api';

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

export default function BookingModal() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const [resort, setResort] = useState<Resort | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState({
    checkIn: new Date(),
    checkOut: new Date(Date.now() + 86400000), // Tomorrow
    guests: 1,
  });
  const [showDatePicker, setShowDatePicker] = useState<'checkIn' | 'checkOut' | null>(null);

  useEffect(() => {
    loadResort();
  }, [id]);

  const loadResort = async () => {
    try {
      const data = await api.getResort(id as string);
      setResort(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load resort details');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!resort) return 0;
    const nights = Math.ceil((booking.checkOut.getTime() - booking.checkIn.getTime()) / (1000 * 60 * 60 * 24));
    return nights * resort.price_per_night * booking.guests;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(null);
    
    if (selectedDate && showDatePicker) {
      setBooking(prev => ({
        ...prev,
        [showDatePicker]: selectedDate
      }));
    }
  };

  const handleBook = async () => {
    if (!user || !token) {
      Alert.alert('Error', 'Please login to book');
      return;
    }

    if (booking.checkIn >= booking.checkOut) {
      Alert.alert('Error', 'Check-out date must be after check-in date');
      return;
    }

    try {
      await api.createBooking(
        resort!.id,
        booking.checkIn.toISOString().split('T')[0],
        booking.checkOut.toISOString().split('T')[0],
        booking.guests,
        token
      );
      
      Alert.alert('Success', 'Booking confirmed!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create booking');
    }
  };

  if (loading || !resort) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Resort</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <Image source={{ uri: `${API_URL}${resort.image_url}` }} style={styles.resortImage} />
        
        <View style={styles.resortInfo}>
          <Text style={styles.resortName}>{resort.name}</Text>
          <View style={styles.rating}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>{resort.rating}</Text>
            <Text style={styles.location}>
              <Ionicons name="location-outline" size={14} color="#666" />
              {resort.location}
            </Text>
          </View>
          <Text style={styles.description}>{resort.description}</Text>
          
          <View style={styles.amenitiesSection}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenities}>
              {resort.amenities.map((amenity, index) => (
                <View key={index} style={styles.amenity}>
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.bookingForm}>
            <Text style={styles.sectionTitle}>Booking Details</Text>
            
            <View style={styles.dateRow}>
              <TouchableOpacity 
                style={styles.dateInput}
                onPress={() => setShowDatePicker('checkIn')}
              >
                <Text style={styles.dateLabel}>Check-in</Text>
                <Text style={styles.dateValue}>
                  {booking.checkIn.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.dateInput}
                onPress={() => setShowDatePicker('checkOut')}
              >
                <Text style={styles.dateLabel}>Check-out</Text>
                <Text style={styles.dateValue}>
                  {booking.checkOut.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={showDatePicker === 'checkIn' ? booking.checkIn : booking.checkOut}
                mode="date"
                display="default"
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}

            <View style={styles.guestsInput}>
              <Text style={styles.inputLabel}>Guests</Text>
              <View style={styles.guestsControl}>
                <TouchableOpacity
                  style={styles.guestButton}
                  onPress={() => setBooking(prev => ({
                    ...prev,
                    guests: Math.max(1, prev.guests - 1)
                  }))}
                >
                  <Ionicons name="remove" size={20} color="#666" />
                </TouchableOpacity>
                <Text style={styles.guestsCount}>{booking.guests}</Text>
                <TouchableOpacity
                  style={styles.guestButton}
                  onPress={() => setBooking(prev => ({
                    ...prev,
                    guests: prev.guests + 1
                  }))}
                >
                  <Ionicons name="add" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.priceSummary}>
              <Text style={styles.sectionTitle}>Price Summary</Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>
                  ${resort.price_per_night} x {Math.ceil((booking.checkOut.getTime() - booking.checkIn.getTime()) / (1000 * 60 * 60 * 24))} nights
                </Text>
                <Text style={styles.priceValue}>${calculateTotal().toFixed(2)}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalPrice}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${calculateTotal().toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={styles.bookButton} onPress={handleBook}>
          <Text style={styles.bookButtonText}>Confirm Booking</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  resortImage: {
    width: '100%',
    height: 250,
  },
  resortInfo: {
    padding: 20,
  },
  resortName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 4,
    marginRight: 16,
  },
  location: {
    fontSize: 14,
    color: '#666',
    flexDirection: 'row',
    alignItems: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
  },
  amenitiesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  amenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenity: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  amenityText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  bookingForm: {
    marginBottom: 100,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dateInput: {
    flex: 0.48,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    padding: 16,
  },
  dateLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  guestsInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  guestsControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guestButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 16,
  },
  priceSummary: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingTop: 20,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 16,
    color: '#666',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalPrice: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF385C',
  },
  bookButton: {
    backgroundColor: '#FF385C',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  bookButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});