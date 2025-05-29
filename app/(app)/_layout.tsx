import React, { useEffect } from 'react';
import { Redirect, Stack } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { checkAuth } from '@/store/slices/authSlice';
import { ActivityIndicator, View } from 'react-native';
import Colors from '@/constants/Colors';

export default function AppLayout() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Check if user is logged in
  // For demo purposes, let's allow using the app without authentication
  // In a real app, you might want to redirect to login if not authenticated
  /*
  if (!isAuthenticated && !isLoading) {
    return <Redirect href="/(auth)/login" />;
  }
  */

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}