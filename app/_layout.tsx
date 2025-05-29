import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { Platform, SafeAreaView } from 'react-native';

// Create a client
const queryClient = new QueryClient();

export default function RootLayout() {
  useFrameworkReady();

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaView style={{ flex: 1 }}>
          <Stack
            screenOptions={{
              headerShown: false,
              animation:
                Platform.OS === 'android' ? 'fade_from_bottom' : 'default',
            }}
          >
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(app)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" options={{ title: 'Not Found' }} />
          </Stack>
        </SafeAreaView>
        <StatusBar style="auto" />
      </QueryClientProvider>
    </Provider>
  );
}
