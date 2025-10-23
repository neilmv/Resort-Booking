import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { api, API_URL } from "../../utils/api";

interface Booking {
  booking_id: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  status: string;
  booking_date: string;
  resort_id: string;
  resort_name: string;
  location: string;
  image_url: string;
  rating: number;
}

export default function BookingsScreen() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadBookings = async () => {
    if (!user || !token) {
      setLoading(false);
      return;
    }

    try {
      const data = await api.getUserBookings(token);
      setBookings(data);
    } catch (error) {
      Alert.alert("Error", "Failed to load bookings");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [user, token]);

  const onRefresh = () => {
    setRefreshing(true);
    loadBookings();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "#4CAF50";
      case "pending":
        return "#FF9800";
      case "cancelled":
        return "#F44336";
      default:
        return "#666";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmed";
      case "pending":
        return "Pending";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    return nights;
  };
  const formatPrice = (price: any) => {
    if (price === undefined || price === null) {
      return "0.00";
    }

    // Convert to number if it's a string
    const numPrice = typeof price === "string" ? parseFloat(price) : price;

    if (isNaN(numPrice)) {
      return "0.00";
    }

    return numPrice.toFixed(2);
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={["#FF385C", "#FF6B8B"]} style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>Booking History</Text>
            <Text style={styles.subtitle}>
              View your past and upcoming stays
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.centeredContent}>
          <Ionicons name="calendar-outline" size={64} color="#CCC" />
          <Text style={styles.loginTitle}>Login Required</Text>
          <Text style={styles.loginSubtitle}>
            Please login to view your booking history
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#FF385C", "#FF6B8B"]} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>Booking History</Text>
          <Text style={styles.subtitle}>View your past and upcoming stays</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.centeredContent}>
            <Text>Loading your bookings...</Text>
          </View>
        ) : bookings.length === 0 ? (
          <View style={styles.centeredContent}>
            <Ionicons name="calendar-outline" size={64} color="#CCC" />
            <Text style={styles.noBookingsTitle}>No Bookings Yet</Text>
            <Text style={styles.noBookingsSubtitle}>
              Start planning your next getaway!
            </Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => router.push("/(tabs)")}
            >
              <Text style={styles.exploreButtonText}>Explore Resorts</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>
              {bookings.length} Booking{bookings.length !== 1 ? "s" : ""}
            </Text>

            {bookings.map((booking) => (
              <View key={booking.booking_id} style={styles.bookingCard}>
                <Image
                  source={{ uri: `${API_URL}${booking.image_url}` }}
                  style={styles.bookingImage}
                />
                <View style={styles.bookingInfo}>
                  <View style={styles.bookingHeader}>
                    <Text style={styles.resortName}>{booking.resort_name}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(booking.status) },
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {getStatusText(booking.status)}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.bookingLocation}>
                    <Ionicons name="location-outline" size={12} color="#666" />
                    {booking.location}
                  </Text>

                  <View style={styles.bookingDetails}>
                    <View style={styles.detailRow}>
                      <Ionicons
                        name="calendar-outline"
                        size={14}
                        color="#666"
                      />
                      <Text style={styles.detailText}>
                        {formatDate(booking.check_in)} -{" "}
                        {formatDate(booking.check_out)}
                      </Text>
                      <Text style={styles.nightsText}>
                        ({calculateNights(booking.check_in, booking.check_out)}{" "}
                        nights)
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Ionicons name="people-outline" size={14} color="#666" />
                      <Text style={styles.detailText}>
                        {booking.guests} Guest{booking.guests !== 1 ? "s" : ""}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Ionicons name="star-outline" size={14} color="#666" />
                      <Text style={styles.detailText}>
                        Rated {booking.rating}/5
                      </Text>
                    </View>
                  </View>

                  <View style={styles.bookingFooter}>
                    <View>
                      <Text style={styles.bookingDate}>
                        Booked on {formatDate(booking.booking_date)}
                      </Text>
                      <Text style={styles.totalPrice}>
                         ${formatPrice(booking.total_price)}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.viewButton}
                      onPress={() =>
                        router.push(`/modal?id=${booking.resort_id}`)
                      }
                    >
                      <Text style={styles.viewButtonText}>View Resort</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#FFF",
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  centeredContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: "#FF385C",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  noBookingsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  noBookingsSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: "#FF385C",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  bookingCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  bookingImage: {
    width: "100%",
    height: 120,
  },
  bookingInfo: {
    padding: 16,
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  resortName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  bookingLocation: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  bookingDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
    marginRight: 8,
  },
  nightsText: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
  },
  bookingFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    paddingTop: 12,
  },
  bookingDate: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF385C",
  },
  viewButton: {
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  viewButtonText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
});
