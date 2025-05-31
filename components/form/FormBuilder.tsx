import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useForm, Controller, UseFormProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Colors from '@/constants/Colors';

export interface FormField {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  validation?: z.ZodTypeAny;
}

interface FormBuilderProps {
  fields: FormField[];
  onSubmit: (data: any) => void;
  submitLabel?: string;
  style?: ViewStyle;
  loading?: boolean;
  error?: string;
  formProps?: UseFormProps;
}

export function FormBuilder({
  fields,
  onSubmit,
  submitLabel = 'Submit',
  style,
  loading = false,
  error,
  formProps,
}: FormBuilderProps) {
  // Create schema from fields
  const schema = z.object(
    fields.reduce((acc, field) => ({
      ...acc,
      [field.name]: field.validation || z.string(),
    }), {})
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    ...formProps,
  });

  return (
    <View style={[styles.container, style]}>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {fields.map((field) => (
        <Controller
          key={field.name}
          control={control}
          name={field.name}
          render={({ field: { onChange, value, onBlur } }) => (
            <Input
              label={field.label}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={field.placeholder}
              leftIcon={field.leftIcon}
              rightIcon={field.rightIcon}
              error={errors[field.name]?.message?.toString()}
              secureTextEntry={field.type === 'password'}
              keyboardType={field.type === 'number' ? 'numeric' : 'default'}
              autoCapitalize={field.type === 'email' ? 'none' : 'sentences'}
            />
          )}
        />
      ))}

      <Button
        title={submitLabel}
        onPress={handleSubmit(onSubmit)}
        loading={loading}
        style={styles.submitButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  errorContainer: {
    backgroundColor: Colors.error[50],
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.error[100],
  },
  errorText: {
    color: Colors.error[700],
    fontSize: 14,
  },
  submitButton: {
    marginTop: 24,
  },
});