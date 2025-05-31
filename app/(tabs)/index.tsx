import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
  ScrollView,
} from 'react-native';
import { SafeAreaWrapper } from '@/components/layout/SafeAreaWrapper';
import ChatHeader from '@/components/chat/ChatHeader';
import ChatEmpty from '@/components/chat/ChatEmpty';
import ChatMessages from '@/components/chat/ChatMessages';
import ChatInput from '@/components/chat/ChatInput';
import Colors from '@/constants/Colors';
import { useApiMutation, useApiQuery } from '@/hooks/useApi';
import { useQueryClient } from '@tanstack/react-query';
import { Book, Calculator, FileText, Lightbulb } from 'lucide-react-native';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
  showFeedback?: boolean;
  attachments?: {
    type: 'image' | 'pdf' | 'audio';
    url: string;
  }[];
  subject?: string;
  topic?: string;
}

const subjects = [
  {
    icon: <Calculator size={24} color={Colors.primary[600]} />,
    name: 'Math',
    color: Colors.primary[100],
  },
  {
    icon: <Book size={24} color={Colors.secondary[600]} />,
    name: 'Science',
    color: Colors.secondary[100],
  },
  {
    icon: <FileText size={24} color={Colors.accent[600]} />,
    name: 'English',
    color: Colors.accent[100],
  },
  {
    icon: <Lightbulb size={24} color={Colors.warning[500]} />,
    name: 'History',
    color: Colors.warning[100],
  },
];

const initialMessages = [
  {
    id: '1',
    content: 'Welcome to Grade Edu AI! I can help you with:',
    isUser: false,
    timestamp: new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
  },
];

export default function HomeScreen() {
  const queryClient = useQueryClient();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showSubjects, setShowSubjects] = useState(true);

  // Fetch chat history
  const { data: messages = initialMessages, isPending } = useApiQuery(
    ['chat-messages'],
    '/messages',
    {
      initialData: initialMessages,
    }
  );

  // Send message mutation
  const { mutate: sendMessage, isPending: isSending } = useApiMutation(
    '/messages',
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
      },
    }
  );

  // Send file mutation
  const { mutate: sendFile, isPending: isUploading } = useApiMutation(
    '/upload',
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
      },
    }
  );

  const handleSendText = (text: string) => {
    sendMessage({
      content: text,
      type: 'text',
      subject: selectedSubject,
    });
  };

  const handleSendFile = async (file: any, type: 'image' | 'pdf') => {
    sendFile({ file, type, subject: selectedSubject });
  };

  const handleSubjectSelect = (subject: string) => {
    setSelectedSubject(subject);
    setShowSubjects(false);
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    // Implement voice recording logic
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    // Implement voice recording stop logic
  };

  const handleFeedback = (isPositive: boolean, messageId: string) => {
    // Implement feedback mutation
  };

  const renderSubjectSelector = () => (
    <View style={styles.subjectsContainer}>
      <Text style={styles.subjectsTitle}>Choose a subject to get started:</Text>
      <View style={styles.subjectsGrid}>
        {subjects.map((subject) => (
          <TouchableOpacity
            key={subject.name}
            style={[styles.subjectButton, { backgroundColor: subject.color }]}
            onPress={() => handleSubjectSelect(subject.name)}
          >
            {subject.icon}
            <Text style={styles.subjectText}>{subject.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderQuickPrompts = () => (
    <View style={styles.promptsContainer}>
      <Text style={styles.promptsTitle}>Quick Actions:</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.promptsScroll}
      >
        <TouchableOpacity
          style={styles.promptButton}
          onPress={() => handleSendText('Can you explain this concept?')}
        >
          <Lightbulb size={20} color={Colors.primary[600]} />
          <Text style={styles.promptText}>Explain Concept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.promptButton}
          onPress={() => handleSendText('Can you solve this step by step?')}
        >
          <Calculator size={20} color={Colors.secondary[600]} />
          <Text style={styles.promptText}>Solve Problem</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.promptButton}
          onPress={() => handleSendText('Can you check my work?')}
        >
          <FileText size={20} color={Colors.accent[600]} />
          <Text style={styles.promptText}>Check Work</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaWrapper style={styles.container}>
      <ChatHeader
        subject={selectedSubject}
        onSubjectChange={() => setShowSubjects(true)}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 104}
      >
        {showSubjects ? (
          renderSubjectSelector()
        ) : (
          <>
            {messages.length === 0 ? (
              <ChatEmpty />
            ) : (
              <>
                <ChatMessages messages={messages} onFeedback={handleFeedback} />
                {renderQuickPrompts()}
              </>
            )}

            <ChatInput
              onSendText={handleSendText}
              onSendFile={handleSendFile}
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecording}
              isRecording={isRecording}
              isPending={isSending || isUploading}
              placeholder={`Ask anything about ${selectedSubject}...`}
            />
          </>
        )}
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
  subjectsContainer: {
    flex: 1,
    padding: 24,
  },
  subjectsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.neutral[800],
    marginBottom: 24,
    textAlign: 'center',
  },
  subjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  subjectButton: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  subjectText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral[800],
    marginTop: 12,
  },
  promptsContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
  promptsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral[600],
    marginBottom: 12,
  },
  promptsScroll: {
    paddingRight: 16,
  },
  promptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[50],
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  promptText: {
    fontSize: 14,
    color: Colors.neutral[700],
    marginLeft: 8,
  },
});
