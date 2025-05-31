import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';
import { MessageSquare as ImageSquare, FileText, Mic } from 'lucide-react-native';

export default function ChatEmpty() {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>Ask me anything!</Text>
      <Text style={styles.emptySubtitle}>I can help you with:</Text>
      
      <View style={styles.featureGrid}>
        <View style={styles.featureItem}>
          <View style={[styles.featureIcon, { backgroundColor: Colors.primary[100] }]}>
            <ImageSquare size={24} color={Colors.primary[600]} />
          </View>
          <Text style={styles.featureText}>Image questions</Text>
        </View>
        
        <View style={styles.featureItem}>
          <View style={[styles.featureIcon, { backgroundColor: Colors.secondary[100] }]}>
            <FileText size={24} color={Colors.secondary[600]} />
          </View>
          <Text style={styles.featureText}>PDF documents</Text>
        </View>
        
        <View style={styles.featureItem}>
          <View style={[styles.featureIcon, { backgroundColor: Colors.accent[100] }]}>
            <Mic size={24} color={Colors.accent[600]} />
          </View>
          <Text style={styles.featureText}>Voice questions</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.neutral[800],
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.neutral[600],
    marginBottom: 24,
  },
  featureGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  featureItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: Colors.neutral[700],
    textAlign: 'center',
  },
});