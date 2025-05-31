import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '@/constants/Colors';
import { ChevronDown } from 'lucide-react-native';

interface ChatHeaderProps {
  subject?: string | null;
  onSubjectChange?: () => void;
}

export default function ChatHeader({ subject, onSubjectChange }: ChatHeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Grade Edu AI</Text>
      {subject && (
        <TouchableOpacity 
          style={styles.subjectButton} 
          onPress={onSubjectChange}
        >
          <Text style={styles.subjectText}>{subject}</Text>
          <ChevronDown size={16} color={Colors.primary[600]} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
    backgroundColor: Colors.white,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary[700],
  },
  subjectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary[50],
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  subjectText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary[600],
    marginRight: 4,
  },
});