import { IconSymbol } from "@/components/ui/icon-symbol";
import { Tabs } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function TabLayout() {
  const { user } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#FF385C",
        tabBarInactiveTintColor: "#8E8E8E",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E5E5E5",
        },
        headerStyle: {
          backgroundColor: "#FF385C",
        },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              name={focused ? "house.fill" : "house.fill"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol name="magnifyingglass" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookmark.fill"
        options={{
          title: "My Bookings",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol name="paperplane.fill" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              name={focused ? "person.crop.circle.fill" : "person.crop.circle"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
