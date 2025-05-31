import React, { useState, useRef } from 'react';
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
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { submitQuestion } from '@/store/slices/questionSlice';

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
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [selectedFile, setSelectedFile] = useState<any>(null);

  const dispatch = useDispatch<AppDispatch>();
  const { isSubmitting, isProcessing } = useSelector((state: RootState) => state.question);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSendText = (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content: text,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    const thinkingMessage: Message = {
      id: `thinking-${Date.now()}`,
      content: 'Thinking...',
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages(prev => [...prev, thinkingMessage]);
    
    dispatch(submitQuestion({
      prompt: text,
      type: 'text',
    })).then(() => {
      setMessages(prev => prev.filter(msg => msg.id !== thinkingMessage.id));
    });
  };

  const handleSendFile = (file: any, type: 'image' | 'pdf') => {
    setSelectedFile({ file, type });
    
    const fileMessage: Message = {
      id: Date.now().toString(),
      content: `Sent a ${type === 'image' ? 'photo' : 'PDF document'}`,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages(prev => [...prev, fileMessage]);
    
    const processingMessage: Message = {
      id: `processing-${Date.now()}`,
      content: `Processing your ${type === 'image' ? 'image' : 'document'}...`,
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages(prev => [...prev, processingMessage]);
    
    dispatch(submitQuestion({
      prompt: `Analyze this ${type === 'image' ? 'image' : 'document'}`,
      type,
      file,
    })).then(() => {
      setMessages(prev => prev.filter(msg => msg.id !== processingMessage.id));
    });
  };

  const handleFeedback = (isPositive: boolean, messageId: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: msg.content + (isPositive ? ' (👍 Helpful)' : ' (👎 Not helpful)') } 
          : msg
      )
    );
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
          isRecording={isRecording}
          isLoading={isSubmitting || isProcessing}
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