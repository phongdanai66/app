import React, { useEffect, useState } from "react";
import {
  Platform,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

import LoginScreen from "./auth/LoginScreen";
import RegisterScreen from "./auth/RegisterScreen";
import AppTabs from "./screens/AppTabs";

const Stack = createNativeStackNavigator();

function AppNavigator({ user }) {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="AppTabs" component={AppTabs} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return <View style={styles.loadingScreen} />;

  if (Platform.OS !== "web") {
    return <AppNavigator user={user} />;
  }

  const showDeviceFrame = width >= 700;
  const frameHeight = showDeviceFrame ? Math.min(height - 40, 900) : height;

  return (
    <View style={styles.webBackdrop}>
      <View
        style={[
          styles.webApp,
          { height: frameHeight },
          showDeviceFrame && styles.deviceFrame,
        ]}
      >
        <AppNavigator user={user} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  webBackdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#020617",
  },
  webApp: {
    width: "100%",
    maxWidth: 430,
    overflow: "hidden",
    backgroundColor: "#0f172a",
  },
  deviceFrame: {
    borderWidth: 10,
    borderColor: "#111827",
    borderRadius: 38,
    boxShadow: "0 24px 80px rgba(0, 0, 0, 0.55)",
  },
});
