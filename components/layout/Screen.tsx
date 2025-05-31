import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Text,
} from 'react-native';
import { SafeAreaWrapper } from './SafeAreaWrapper';
import Colors from '@/constants/Colors';

interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  scrollable?: boolean;
  keyboardAvoiding?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  backgroundColor?: string;
  loading?: boolean;
  error?: string;
  loadingText?: string;
  errorRetry?: () => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  contentContainerStyle?: ViewStyle;
}

export function Screen({
  children,
  style,
  scrollable = true,
  keyboardAvoiding = true,
  refreshing = false,
  onRefresh,
  backgroundColor = Colors.white,
  loading = false,
  error,
  loadingText = 'Loading...',
  errorRetry,
  header,
  footer,
  contentContainerStyle,
}: ScreenProps) {
  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
          {loadingText && <Text style={styles.loadingText}>{loadingText}</Text>}
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          {errorRetry && (
            <TouchableOpacity style={styles.retryButton} onPress={errorRetry}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    if (scrollable) {
      return (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, contentContainerStyle, style]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[Colors.primary[500]]}
                tintColor={Colors.primary[500]}
              />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      );
    }

    return <View style={[styles.container, style]}>{children}</View>;
  };

  const content = keyboardAvoiding ? (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoid}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      {renderContent()}
    </KeyboardAvoidingView>
  ) : (
    renderContent()
  );

  return (
    <SafeAreaWrapper style={[styles.screen, { backgroundColor }]}>
      {header}
      {content}
      {footer}
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.neutral[600],
  },
  errorText: {
    fontSize: 16,
    color: Colors.error[600],
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.primary[100],
    borderRadius: 8,
  },
  retryText: {
    fontSize: 14,
    color: Colors.primary[600],
    fontWeight: '500',
  },
});