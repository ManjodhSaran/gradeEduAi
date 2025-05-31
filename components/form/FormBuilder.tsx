import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  Platform,
  ScrollView,
} from 'react-native';
import { useForm, Controller, UseFormProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Colors from '@/constants/Colors';
import DateTimePicker from '@react-native-community/datetimepicker';
import PhoneInput from 'react-native-phone-number-input';
import { Eye, EyeOff, ChevronDown, Calendar, Search } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';

export interface FormField {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'phone' | 'date' | 'select' | 'multiselect' | 'search' | 'textarea' | 'checkbox' | 'radio';
  placeholder?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  validation?: z.ZodTypeAny;
  options?: { label: string; value: string | number }[];
  multiple?: boolean;
  format?: string;
  min?: string | number | Date;
  max?: string | number | Date;
  rows?: number;
  helperText?: string;
  disabled?: boolean;
}

interface FormBuilderProps {
  fields: FormField[];
  onSubmit: (data: any) => void;
  submitLabel?: string;
  style?: ViewStyle;
  loading?: boolean;
  error?: string;
  formProps?: UseFormProps;
  scrollable?: boolean;
}

export function FormBuilder({
  fields,
  onSubmit,
  submitLabel = 'Submit',
  style,
  loading = false,
  error,
  formProps,
  scrollable = true,
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
    const error = errors[field.name]?.message?.toString();

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
            error={error}
            disabled={field.disabled}
          />
        );

      case 'phone':
        return (
          <Controller
            control={control}
            name={field.name}
            render={({ field: { onChange, value } }) => (
              <View>
                <Text style={styles.label}>{field.label}</Text>
                <PhoneInput
                  defaultValue={value}
                  defaultCode="US"
                  layout="first"
                  onChangeFormattedText={onChange}
                  containerStyle={[
                    styles.phoneInput,
                    error && styles.inputError,
                    field.disabled && styles.inputDisabled,
                  ]}
                  textContainerStyle={styles.phoneInputText}
                  textInputStyle={styles.phoneInputTextInput}
                  codeTextStyle={styles.phoneInputCode}
                  disabled={field.disabled}
                />
                {error && <Text style={styles.errorText}>{error}</Text>}
                {field.helperText && <Text style={styles.helperText}>{field.helperText}</Text>}
              </View>
            )}
          />
        );

      case 'date':
        return (
          <View>
            <Text style={styles.label}>{field.label}</Text>
            <TouchableOpacity
              style={[
                styles.dateInput,
                error && styles.inputError,
                field.disabled && styles.inputDisabled,
              ]}
              onPress={() => !field.disabled && toggleDatePicker(field.name, true)}
              disabled={field.disabled}
            >
              <Text style={[
                styles.dateInputText,
                !value && styles.placeholderText,
                field.disabled && styles.disabledText,
              ]}>
                {value ? new Date(value).toLocaleDateString() : field.placeholder}
              </Text>
              <Calendar size={20} color={Colors.neutral[500]} />
            </TouchableOpacity>
            {error && <Text style={styles.errorText}>{error}</Text>}
            {field.helperText && <Text style={styles.helperText}>{field.helperText}</Text>}
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
                minimumDate={field.min ? new Date(field.min) : undefined}
                maximumDate={field.max ? new Date(field.max) : undefined}
              />
            )}
          </View>
        );

      case 'select':
      case 'multiselect':
        return (
          <View>
            <Text style={styles.label}>{field.label}</Text>
            <TouchableOpacity
              style={[
                styles.selectInput,
                error && styles.inputError,
                field.disabled && styles.inputDisabled,
              ]}
              onPress={() => !field.disabled && setShowPicker(prev => ({ ...prev, [field.name]: true }))}
              disabled={field.disabled}
            >
              <Text style={[
                styles.selectInputText,
                !value && styles.placeholderText,
                field.disabled && styles.disabledText,
              ]}>
                {field.options?.find(opt => opt.value === value)?.label || field.placeholder}
              </Text>
              <ChevronDown size={20} color={Colors.neutral[500]} />
            </TouchableOpacity>
            {error && <Text style={styles.errorText}>{error}</Text>}
            {field.helperText && <Text style={styles.helperText}>{field.helperText}</Text>}
            {showPicker[field.name] && (
              <Picker
                selectedValue={value}
                onValueChange={(itemValue) => {
                  setValue(field.name, itemValue);
                  setShowPicker(prev => ({ ...prev, [field.name]: false }));
                }}
                style={styles.picker}
                enabled={!field.disabled}
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
          </View>
        );

      case 'search':
        return (
          <Input
            label={field.label}
            placeholder={field.placeholder}
            leftIcon={<Search size={20} color={Colors.neutral[500]} />}
            error={error}
            autoCapitalize="none"
            autoCorrect={false}
            disabled={field.disabled}
          />
        );

      case 'textarea':
        return (
          <Input
            label={field.label}
            placeholder={field.placeholder}
            multiline
            numberOfLines={field.rows || 4}
            textAlignVertical="top"
            style={styles.textarea}
            error={error}
            disabled={field.disabled}
          />
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
            error={error}
            disabled={field.disabled}
          />
        );
    }
  };

  const content = (
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

  if (scrollable) {
    return (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {content}
      </ScrollView>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
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
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: Colors.neutral[700],
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  textarea: {
    height: 100,
    textAlignVertical: 'top',
  },
  placeholderText: {
    color: Colors.neutral[400],
  },
  helperText: {
    fontSize: 12,
    color: Colors.neutral[500],
    marginTop: 4,
  },
  inputError: {
    borderColor: Colors.error[500],
  },
  inputDisabled: {
    backgroundColor: Colors.neutral[100],
    borderColor: Colors.neutral[300],
  },
  disabledText: {
    color: Colors.neutral[500],
  },
});