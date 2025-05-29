import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaWrapper } from '@/components/layout/SafeAreaWrapper';
import ChatBubble from '@/components/chat/ChatBubble';
import ChatInput from '@/components/chat/ChatInput';
import Colors from '@/constants/Colors';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { submitQuestion, clearCurrentQuestion } from '@/store/slices/questionSlice';
import { MessageSquare as ImageSquare, FileText, Mic } from 'lucide-react-native';

// Example initial messages for demonstration
const initialMessages = [
  {
    id: '1',
    content: 'Welcome to Grade Edu AI! Ask me any question, and I\'ll provide step-by-step solutions.',
    isUser: false,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
];

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
  showFeedback?: boolean;
}

export default function HomeScreen() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [selectedFile, setSelectedFile] = useState<any>(null);

  const dispatch = useDispatch<AppDispatch>();
  const { 
    currentQuestion, 
    currentSolution, 
    isSubmitting, 
    isProcessing 
  } = useSelector((state: RootState) => state.question);

  const flatListRef = useRef<FlatList>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  useEffect(() => {
    // Add solution steps to messages when available
    if (currentSolution?.steps && currentSolution.steps.length > 0) {
      const solutionMessages = currentSolution.steps.map((step, index) => ({
        id: `solution-${currentSolution.id}-${index}`,
        content: step.content,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        showFeedback: index === currentSolution.steps.length - 1, // Only show feedback on last step
      }));

      setMessages(prev => [...prev, ...solutionMessages]);
    }
  }, [currentSolution]);

  const handleSendText = (text: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: text,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Add thinking message
    const thinkingMessage: Message = {
      id: `thinking-${Date.now()}`,
      content: 'Thinking...',
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages(prev => [...prev, thinkingMessage]);
    
    // Submit to AI
    dispatch(submitQuestion({
      prompt: text,
      type: 'text',
    })).then(() => {
      // Remove thinking message
      setMessages(prev => prev.filter(msg => msg.id !== thinkingMessage.id));
    });
  };

  const handleSendFile = (file: any, type: 'image' | 'pdf') => {
    setSelectedFile({ file, type });
    
    // Add file message
    const fileMessage: Message = {
      id: Date.now().toString(),
      content: `Sent a ${type === 'image' ? 'photo' : 'PDF document'}`,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages(prev => [...prev, fileMessage]);
    
    // Add processing message
    const processingMessage: Message = {
      id: `processing-${Date.now()}`,
      content: `Processing your ${type === 'image' ? 'image' : 'document'}...`,
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages(prev => [...prev, processingMessage]);
    
    // Submit to AI
    dispatch(submitQuestion({
      prompt: `Analyze this ${type === 'image' ? 'image' : 'document'}`,
      type,
      file,
    })).then(() => {
      // Remove processing message
      setMessages(prev => prev.filter(msg => msg.id !== processingMessage.id));
    });
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingDuration(0);
    
    // Start recording timer
    recordingTimerRef.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
    
    // In a real app, this would start actual audio recording
    // using Expo Audio or react-native-audio-recorder-player
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    
    // Add recording message
    const recordingMessage: Message = {
      id: Date.now().toString(),
      content: `Sent a voice recording (${formatDuration(recordingDuration)})`,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages(prev => [...prev, recordingMessage]);
    
    // Add transcribing message
    const transcribingMessage: Message = {
      id: `transcribing-${Date.now()}`,
      content: 'Transcribing your audio...',
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages(prev => [...prev, transcribingMessage]);
    
    // In a real app, this would send the actual recording
    // For demo, let's simulate with a timeout
    setTimeout(() => {
      // Remove transcribing message
      setMessages(prev => prev.filter(msg => msg.id !== transcribingMessage.id));
      
      // Add transcribed message
      const transcribedMessage: Message = {
        id: `transcribed-${Date.now()}`,
        content: 'I need help solving this math problem: What is the area of a circle with radius 5cm?',
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      
      setMessages(prev => [...prev, transcribedMessage]);
      
      // Add thinking message
      const thinkingMessage: Message = {
        id: `thinking-${Date.now()}`,
        content: 'Thinking...',
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      
      setMessages(prev => [...prev, thinkingMessage]);
      
      // Simulate AI response
      setTimeout(() => {
        // Remove thinking message
        setMessages(prev => prev.filter(msg => msg.id !== thinkingMessage.id));
        
        // Add AI response
        const aiResponse: Message[] = [
          {
            id: `solution-1-${Date.now()}`,
            content: 'To find the area of a circle, we use the formula: A = πr²',
            isUser: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
          {
            id: `solution-2-${Date.now()}`,
            content: 'Given information:\n- Radius (r) = 5 cm',
            isUser: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
          {
            id: `solution-3-${Date.now()}`,
            content: 'Step 1: Substitute the radius into the formula.\nA = π × (5 cm)²',
            isUser: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
          {
            id: `solution-4-${Date.now()}`,
            content: 'Step 2: Calculate the square of the radius.\nA = π × 25 cm²',
            isUser: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
          {
            id: `solution-5-${Date.now()}`,
            content: 'Step 3: Multiply by π.\nA = 25π cm²\nA ≈ 78.54 cm² (using π ≈ 3.14159)',
            isUser: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            showFeedback: true,
          },
        ];
        
        setMessages(prev => [...prev, ...aiResponse]);
      }, 2000);
    }, 2000);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleFeedback = (isPositive: boolean, messageId: string) => {
    // In a real app, this would send feedback to the API
    console.log('Feedback:', isPositive, 'for message:', messageId);
    
    // Update the message to show feedback was given
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: msg.content + (isPositive ? ' (👍 Helpful)' : ' (👎 Not helpful)') } 
          : msg
      )
    );
  };

  const renderFilePreview = () => {
    if (!selectedFile) return null;
    
    return (
      <View style={styles.filePreview}>
        {selectedFile.type === 'image' ? (
          <>
            <Image 
              source={{ uri: selectedFile.file.uri }} 
              style={styles.imagePreview} 
            />
            <TouchableOpacity 
              style={styles.removeFileButton}
              onPress={() => setSelectedFile(null)}
            >
              <Text style={styles.removeFileText}>×</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.pdfPreview}>
            <FileText size={24} color={Colors.error[500]} />
            <Text style={styles.pdfName} numberOfLines={1}>
              {selectedFile.file.name}
            </Text>
            <TouchableOpacity 
              style={styles.removeFileButton}
              onPress={() => setSelectedFile(null)}
            >
              <Text style={styles.removeFileText}>×</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderItem = ({ item }: { item: Message }) => (
    <ChatBubble
      content={item.content}
      isUser={item.isUser}
      timestamp={item.timestamp}
      showFeedback={item.showFeedback}
      onFeedback={(isPositive) => handleFeedback(isPositive, item.id)}
    />
  );

  const renderEmptyState = () => (
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

  return (
    <SafeAreaWrapper style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Grade Edu AI</Text>
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 104}
      >
        {messages.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        )}
        
        {isRecording && (
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>
              Recording... {formatDuration(recordingDuration)}
            </Text>
          </View>
        )}
        
        {renderFilePreview()}
        
        <ChatInput
          onSendText={handleSendText}
          onSendFile={handleSendFile}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
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
  keyboardAvoid: {
    flex: 1,
  },
  messageList: {
    padding: 16,
  },
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
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error[50],
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.error[500],
    marginRight: 8,
  },
  recordingText: {
    color: Colors.error[700],
    fontSize: 14,
    fontWeight: '500',
  },
  filePreview: {
    margin: 16,
    marginTop: 0,
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  pdfPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[100],
    padding: 12,
    borderRadius: 8,
  },
  pdfName: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: Colors.neutral[800],
  },
  removeFileButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeFileText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});