import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useForm, Controller, UseFormProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Colors from '@/constants/Colors';
import DateTimePicker from '@react-native-community/datetimepicker';
import PhoneInput from 'react-native-phone-number-input';
import { Eye, EyeOff, ChevronDown } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';

export interface FormField {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'phone' | 'date' | 'select' | 'multiselect';
  placeholder?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  validation?: z.ZodTypeAny;
  options?: { label: string; value: string | number }[];
  multiple?: boolean;
  format?: string;
  min?: string | number | Date;
  max?: string | number | Date;
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
  const [showPassword, setShowPassword] = React.useState<{ [key: string]: boolean }>({});
  const [showDatePicker, setShowDatePicker] = React.useState<{ [key: string]: boolean }>({});
  const [showPicker, setShowPicker] = React.useState<{ [key: string]: boolean }>({});

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
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    ...formProps,
  });

  const togglePasswordVisibility = (fieldName: string) => {
    setShowPassword(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  const toggleDatePicker = (fieldName: string, show: boolean) => {
    setShowDatePicker(prev => ({
      ...prev,
      [fieldName]: show,
    }));
  };

  const renderField = (field: FormField) => {
    const value = watch(field.name);

    switch (field.type) {
      case 'password':
        return (
          <Input
            label={field.label}
            secureTextEntry={!showPassword[field.name]}
            leftIcon={field.leftIcon}
            rightIcon={
              <TouchableOpacity onPress={() => togglePasswordVisibility(field.name)}>
                {showPassword[field.name] ? (
                  <EyeOff size={20} color={Colors.neutral[500]} />
                ) : (
                  <Eye size={20} color={Colors.neutral[500]} />
                )}
              </TouchableOpacity>
            }
            placeholder={field.placeholder}
            error={errors[field.name]?.message?.toString()}
          />
        );

      case 'phone':
        return (
          <Controller
            control={control}
            name={field.name}
            render={({ field: { onChange, value } }) => (
              <PhoneInput
                defaultValue={value}
                defaultCode="US"
                layout="first"
                onChangeFormattedText={onChange}
                containerStyle={styles.phoneInput}
                textContainerStyle={styles.phoneInputText}
                textInputStyle={styles.phoneInputTextInput}
                codeTextStyle={styles.phoneInputCode}
              />
            )}
          />
        );

      case 'date':
        return (
          <>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => toggleDatePicker(field.name, true)}
            >
              <Text style={styles.dateInputText}>
                {value ? new Date(value).toLocaleDateString() : field.placeholder}
              </Text>
            </TouchableOpacity>
            {showDatePicker[field.name] && (
              <DateTimePicker
                value={value ? new Date(value) : new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  toggleDatePicker(field.name, Platform.OS === 'ios');
                  if (selectedDate) {
                    setValue(field.name, selectedDate);
                  }
                }}
              />
            )}
          </>
        );

      case 'select':
      case 'multiselect':
        return (
          <TouchableOpacity
            style={styles.selectInput}
            onPress={() => setShowPicker(prev => ({ ...prev, [field.name]: true }))}
          >
            <Text style={styles.selectInputText}>
              {field.options?.find(opt => opt.value === value)?.label || field.placeholder}
            </Text>
            <ChevronDown size={20} color={Colors.neutral[500]} />
            {showPicker[field.name] && (
              <Picker
                selectedValue={value}
                onValueChange={(itemValue) => {
                  setValue(field.name, itemValue);
                  setShowPicker(prev => ({ ...prev, [field.name]: false }));
                }}
                style={styles.picker}
              >
                {field.options?.map(option => (
                  <Picker.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                  />
                ))}
              </Picker>
            )}
          </TouchableOpacity>
        );

      default:
        return (
          <Input
            label={field.label}
            placeholder={field.placeholder}
            leftIcon={field.leftIcon}
            rightIcon={field.rightIcon}
            keyboardType={field.type === 'number' ? 'numeric' : 'default'}
            autoCapitalize={field.type === 'email' ? 'none' : 'sentences'}
            error={errors[field.name]?.message?.toString()}
          />
        );
    }
  };

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
            <View style={styles.fieldContainer}>
              {renderField(field)}
            </View>
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
  fieldContainer: {
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 24,
  },
  phoneInput: {
    width: '100%',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: 8,
  },
  phoneInputText: {
    backgroundColor: Colors.white,
    borderLeftWidth: 1,
    borderLeftColor: Colors.neutral[300],
  },
  phoneInputTextInput: {
    fontSize: 16,
    color: Colors.neutral[800],
  },
  phoneInputCode: {
    fontSize: 16,
    color: Colors.neutral[800],
  },
  dateInput: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: 8,
    padding: 12,
  },
  dateInputText: {
    fontSize: 16,
    color: Colors.neutral[800],
  },
  selectInput: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectInputText: {
    fontSize: 16,
    color: Colors.neutral[800],
  },
  picker: {
    ...Platform.select({
      ios: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.white,
      },
      android: {
        width: '100%',
      },
    }),
  },
});