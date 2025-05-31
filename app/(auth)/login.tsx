import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { SafeAreaWrapper } from '@/components/layout/SafeAreaWrapper';
import { FormBuilder } from '@/components/form/FormBuilder';
import Colors from '@/constants/Colors';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '@/store/slices/authSlice';
import { AppDispatch, RootState } from '@/store';
import { AtSign, Lock } from 'lucide-react-native';
import { z } from 'zod';

const loginSchema = {
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
};

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const handleLogin = async (data: any) => {
    try {
      await dispatch(login(data)).unwrap();
      router.replace('/(app)/(tabs)/');
    } catch (error) {
      // Error is handled by the redux slice
    }
  };

  const handleSkip = () => {
    router.replace('/(app)/(tabs)/');
  };

  const formFields = [
    {
      name: 'username',
      label: 'Username',
      placeholder: 'Enter your username',
      leftIcon: <AtSign size={20} color={Colors.neutral[500]} />,
      validation: loginSchema.username,
    },
    {
      name: 'password',
      label: 'Password',
      placeholder: 'Enter your password',
      type: 'password',
      leftIcon: <Lock size={20} color={Colors.neutral[500]} />,
      validation: loginSchema.password,
    },
  ];

  return (
    <SafeAreaWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Image
              source={{ uri: 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg' }}
              style={styles.logo}
            />
            <Text style={styles.title}>Grade Edu AI</Text>
            <Text style={styles.subtitle}>Your personal AI study assistant</Text>
          </View>

          <View style={styles.form}>
            <FormBuilder
              fields={formFields}
              onSubmit={handleLogin}
              submitLabel="Login"
              loading={isLoading}
              error={error}
            />

            <TouchableOpacity 
              onPress={() => router.push('/(auth)/forgot-password')}
              style={styles.forgotPasswordButton}
            >
              <Text style={styles.forgotPassword}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
            >
              <Text style={styles.skipText}>Skip Login</Text>
            </TouchableOpacity>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <Link href="/(auth)/register" asChild>
                <TouchableOpacity>
                  <Text style={styles.registerLink}>Register</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary[700],
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.neutral[600],
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  forgotPassword: {
    color: Colors.primary[600],
    fontWeight: '500',
  },
  skipButton: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
  },
  skipText: {
    color: Colors.neutral[700],
    fontWeight: '500',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: {
    color: Colors.neutral[600],
  },
  registerLink: {
    color: Colors.primary[600],
    fontWeight: '500',
  },
});