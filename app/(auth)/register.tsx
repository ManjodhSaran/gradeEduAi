import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { FormBuilder } from '@/components/form/FormBuilder';
import Colors from '@/constants/Colors';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '@/store/slices/authSlice';
import { AppDispatch, RootState } from '@/store';
import { User, AtSign, Mail, Lock } from 'lucide-react-native';
import { z } from 'zod';

const registerSchema = {
  name: z.string().min(1, 'Name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
};

export default function RegisterScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const handleRegister = async (data: any) => {
    if (data.password !== data.confirmPassword) {
      return;
    }

    try {
      await dispatch(register({
        name: data.name,
        username: data.username,
        email: data.email,
        password: data.password,
      })).unwrap();
      router.replace('/(app)/(tabs)/');
    } catch (error) {
      // Error is handled by the redux slice
    }
  };

  const formFields = [
    {
      name: 'name',
      label: 'Full Name',
      placeholder: 'Enter your full name',
      leftIcon: <User size={20} color={Colors.neutral[500]} />,
      validation: registerSchema.name,
      helperText: 'Your full name as it appears on official documents',
    },
    {
      name: 'username',
      label: 'Username',
      placeholder: 'Choose a username',
      leftIcon: <AtSign size={20} color={Colors.neutral[500]} />,
      validation: registerSchema.username,
      helperText: 'This will be your unique identifier',
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'Enter your email',
      leftIcon: <Mail size={20} color={Colors.neutral[500]} />,
      validation: registerSchema.email,
      helperText: "We'll send a verification link to this email",
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      placeholder: 'Create a password',
      leftIcon: <Lock size={20} color={Colors.neutral[500]} />,
      validation: registerSchema.password,
      helperText: 'Must be at least 8 characters with uppercase, lowercase, and number',
    },
    {
      name: 'confirmPassword',
      label: 'Confirm Password',
      type: 'password',
      placeholder: 'Confirm your password',
      leftIcon: <Lock size={20} color={Colors.neutral[500]} />,
      validation: registerSchema.confirmPassword,
    },
  ];

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join Grade Edu AI to get personalized learning help</Text>
      </View>

      <FormBuilder
        fields={formFields}
        onSubmit={handleRegister}
        submitLabel="Register"
        loading={isLoading}
        error={error}
        style={styles.form}
      />

      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Already have an account? </Text>
        <Link href="/(auth)/login" asChild>
          <TouchableOpacity>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
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
    paddingHorizontal: 24,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  loginText: {
    color: Colors.neutral[600],
  },
  loginLink: {
    color: Colors.primary[600],
    fontWeight: '500',
  },
});