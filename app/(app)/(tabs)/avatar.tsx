import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaWrapper } from '@/components/layout/SafeAreaWrapper';
import ChatInput from '@/components/chat/ChatInput';
import ChatMessages from '@/components/chat/ChatMessages';
import ChatHeader from '@/components/chat/ChatHeader';
import ChatEmpty from '@/components/chat/ChatEmpty';
import Colors from '@/constants/Colors';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { submitQuestion } from '@/store/slices/questionSlice';

const AVATAR_FRAMES = {
  neutral: 'https://images.pexels.com/photos/2709388/pexels-photo-2709388.jpeg',
  speaking: 'https://images.pexels.com/photos/2709385/pexels-photo-2709385.jpeg',
  thinking: 'https://images.pexels.com/photos/2709386/pexels-photo-2709386.jpeg',
};

export default function AvatarScreen() {
  const [messages, setMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [avatarState, setAvatarState] = useState('neutral');
  const [isTyping, setIsTyping] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lipSyncTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (lipSyncTimerRef.current) {
        clearInterval(lipSyncTimerRef.current);
      }
    };
  }, []);

  const handleSendText = async (text: string) => {
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      content: text,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    setAvatarState('thinking');

    // Simulate AI thinking
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate AI response
    const aiMessage = {
      id: (Date.now() + 1).toString(),
      content: `I understand your question about "${text}". Let me help you with that.`,
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      showFeedback: true,
    };

    setMessages(prev => [...prev, aiMessage]);
    setIsTyping(false);

    // Simulate lip sync while speaking
    startLipSync();
  };

  const startLipSync = () => {
    let speaking = true;
    lipSyncTimerRef.current = setInterval(() => {
      setAvatarState(speaking ? 'speaking' : 'neutral');
      speaking = !speaking;
    }, 150);

    // Stop lip sync after 3 seconds
    setTimeout(() => {
      if (lipSyncTimerRef.current) {
        clearInterval(lipSyncTimerRef.current);
        setAvatarState('neutral');
      }
    }, 3000);
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
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: AVATAR_FRAMES[avatarState] }}
            style={styles.avatar}
          />
        </View>

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
          isRecording={isRecording}
          isLoading={isTyping}
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
  avatarContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.neutral[100],
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
});