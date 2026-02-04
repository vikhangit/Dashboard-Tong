import React from 'react';
import { StyleSheet, View, ActivityIndicator, Text, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';

const DEFAULT_URL = 'http://localhost:3000';
const ANDROID_EMULATOR_URL = 'http://10.0.2.2:3000';
const WEB_URL = (process.env.EXPO_PUBLIC_WEB_URL as string) ?? (Platform.OS === 'android' ? ANDROID_EMULATOR_URL : DEFAULT_URL);

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <WebView
        source={{ uri: WEB_URL }}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        )}
        onError={(syntheticEvent) => {
          // show a small friendly message if the web app isn't reachable
          // the WebView will still render an error view; keep a simple overlay
          console.warn('WebView error: ', syntheticEvent.nativeEvent);
        }}
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 12 }
});
