import React from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaWrapper } from '@/components/layout/SafeAreaWrapper';
import ChatHeader from '@/components/chat/ChatHeader';
import ChatEmpty from '@/components/chat/ChatEmpty';
import ChatMessages from '@/components/chat/ChatMessages';
import ChatInput from '@/components/chat/ChatInput';
import Colors from '@/constants/Colors';
import { useApiMutation, useApiQuery } from '@/hooks/useApi';
import { useQueryClient } from '@tanstack/react-query';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
  showFeedback?: boolean;
}

const initialMessages = [
  {
    id: '1',
    content: 'Welcome to Grade Edu AI! Ask me any question, and I\'ll provide step-by-step solutions.',
    isUser: false,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
];

export default function HomeScreen() {
  const queryClient = useQueryClient();

  // Fetch chat history
  const { data: messages = initialMessages } = useApiQuery(
    ['chat-messages'],
    '/messages',
    {
      initialData: initialMessages,
    }
  );

  // Send message mutation
  const { mutate: sendMessage, isLoading: isSending } = useApiMutation('/messages', {
    onSuccess: () => {
      queryClient.invalidateQueries(['chat-messages']);
    },
  });

  // Send file mutation
  const { mutate: sendFile, isLoading: isUploading } = useApiMutation('/upload', {
    onSuccess: () => {
      queryClient.invalidateQueries(['chat-messages']);
    },
  });

  const handleSendText = (text: string) => {
    sendMessage({ content: text, type: 'text' });
  };

  const handleSendFile = (file: any, type: 'image' | 'pdf') => {
    sendFile({ file, type });
  };

  const handleFeedback = (isPositive: boolean, messageId: string) => {
    // Implement feedback mutation
  };

  return (
    <SafeAreaWrapper style={styles.container}>
      <ChatHeader />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 104}
      >
        {messages.length === 0 ? (
          <ChatEmpty />
        ) : (
          <ChatMessages
            messages={messages}
            onFeedback={handleFeedback}
          />
        )}
        
        <ChatInput
          onSendText={handleSendText}
          onSendFile={handleSendFile}
          isLoading={isSending || isUploading}
        />
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  keyboardAvoid: {
    flex: 1,
  },
});