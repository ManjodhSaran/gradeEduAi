import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
  ScrollView,
  ActivityIndicator,
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
  isPending?: boolean; // Add pending state for optimistic updates
}

// Memoized subjects array to prevent re-renders
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

// Memoized quick prompts to prevent re-creation
const quickPrompts = [
  {
    id: 'explain',
    text: 'Can you explain this concept?',
    icon: Lightbulb,
    color: Colors.primary[600],
    label: 'Explain Concept',
  },
  {
    id: 'solve',
    text: 'Can you solve this step by step?',
    icon: Calculator,
    color: Colors.secondary[600],
    label: 'Solve Problem',
  },
  {
    id: 'check',
    text: 'Can you check my work?',
    icon: FileText,
    color: Colors.accent[600],
    label: 'Check Work',
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
  const [pendingMessages, setPendingMessages] = useState<Message[]>([]);

  // Fetch chat history with better error handling
  const {
    data: serverMessages = [],
    isPending: isLoadingMessages,
    error: messagesError,
    refetch: refetchMessages,
  } = useApiQuery(['chat-messages', selectedSubject], '/messages', {
    enabled: !showSubjects && !!selectedSubject,
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Send message mutation with optimistic updates
  const { mutate: sendMessage, isPending: isSending } = useApiMutation(
    '/messages',
    {
      onMutate: async (newMessage) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries({
          queryKey: ['chat-messages', selectedSubject],
        });

        // Create optimistic message
        const optimisticMessage: Message = {
          id: `temp-${Date.now()}`,
          content: newMessage.content,
          isUser: true,
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          subject: newMessage.subject,
          isPending: true,
        };

        // Add to pending messages for immediate UI feedback
        setPendingMessages((prev) => [...prev, optimisticMessage]);

        return { optimisticMessage };
      },
      onSuccess: (data, variables, context) => {
        // Remove pending message and add real message
        setPendingMessages((prev) =>
          prev.filter((msg) => msg.id !== context?.optimisticMessage.id)
        );
        queryClient.invalidateQueries({
          queryKey: ['chat-messages', selectedSubject],
        });
      },
      onError: (error, variables, context) => {
        // Remove failed message and show error
        setPendingMessages((prev) =>
          prev.filter((msg) => msg.id !== context?.optimisticMessage?.id)
        );
        // You might want to show an error toast here
        console.error('Failed to send message:', error);
      },
    }
  );

  // Send file mutation with optimistic updates
  const { mutate: sendFile, isPending: isUploading } = useApiMutation(
    '/upload',
    {
      onMutate: async (fileData) => {
        const optimisticMessage: Message = {
          id: `temp-file-${Date.now()}`,
          content: `Uploading ${fileData.type}...`,
          isUser: true,
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          subject: selectedSubject,
          isPending: true,
          attachments: [
            {
              type: fileData.type,
              url: 'pending',
            },
          ],
        };

        setPendingMessages((prev) => [...prev, optimisticMessage]);
        return { optimisticMessage };
      },
      onSuccess: (data, variables, context) => {
        setPendingMessages((prev) =>
          prev.filter((msg) => msg.id !== context?.optimisticMessage.id)
        );
        queryClient.invalidateQueries({
          queryKey: ['chat-messages', selectedSubject],
        });
      },
      onError: (error, variables, context) => {
        setPendingMessages((prev) =>
          prev.filter((msg) => msg.id !== context?.optimisticMessage?.id)
        );
        console.error('Failed to upload file:', error);
      },
    }
  );

  // Feedback mutation
  const { mutate: submitFeedback, isPending: isSubmittingFeedback } =
    useApiMutation('/feedback', {
      onSuccess: () => {
        // Optionally show success feedback
      },
      onError: (error) => {
        console.error('Failed to submit feedback:', error);
      },
    });

  // Memoized handlers to prevent unnecessary re-renders
  const handleSendText = useCallback(
    (text: string) => {
      if (!text.trim() || isSending) return;

      sendMessage({
        content: text.trim(),
        type: 'text',
        subject: selectedSubject,
      });
    },
    [sendMessage, selectedSubject, isSending]
  );

  const handleSendFile = useCallback(
    async (file: any, type: 'image' | 'pdf') => {
      if (isUploading) return;

      sendFile({
        file,
        type,
        subject: selectedSubject,
      });
    },
    [sendFile, selectedSubject, isUploading]
  );

  const handleSubjectSelect = useCallback((subject: string) => {
    setSelectedSubject(subject);
    setShowSubjects(false);
    // Clear pending messages when switching subjects
    setPendingMessages([]);
  }, []);

  const handleStartRecording = useCallback(() => {
    if (isRecording) return;
    setIsRecording(true);
    // TODO: Implement voice recording logic
  }, [isRecording]);

  const handleStopRecording = useCallback(() => {
    if (!isRecording) return;
    setIsRecording(false);
    // TODO: Implement voice recording stop logic
  }, [isRecording]);

  const handleFeedback = useCallback(
    (isPositive: boolean, messageId: string) => {
      submitFeedback({
        messageId,
        isPositive,
        subject: selectedSubject,
      });
    },
    [submitFeedback, selectedSubject]
  );

  const handleBackToSubjects = useCallback(() => {
    setShowSubjects(true);
    setPendingMessages([]);
  }, []);

  const handleQuickPrompt = useCallback(
    (promptText: string) => {
      handleSendText(promptText);
    },
    [handleSendText]
  );

  // Combine server messages with pending messages
  const allMessages = useMemo(() => {
    const baseMessages = showSubjects ? initialMessages : serverMessages;
    return [...baseMessages, ...pendingMessages];
  }, [serverMessages, pendingMessages, showSubjects]);

  // Memoized subject selector
  const subjectSelector = useMemo(
    () => (
      <View style={styles.subjectsContainer}>
        <Text style={styles.subjectsTitle}>
          Choose a subject to get started:
        </Text>
        <View style={styles.subjectsGrid}>
          {subjects.map((subject) => (
            <TouchableOpacity
              key={subject.name}
              style={[styles.subjectButton, { backgroundColor: subject.color }]}
              onPress={() => handleSubjectSelect(subject.name)}
              disabled={isLoadingMessages}
            >
              {subject.icon}
              <Text style={styles.subjectText}>{subject.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    ),
    [handleSubjectSelect, isLoadingMessages]
  );

  // Memoized quick prompts
  const quickPromptsComponent = useMemo(
    () => (
      <View style={styles.promptsContainer}>
        <Text style={styles.promptsTitle}>Quick Actions:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.promptsScroll}
        >
          {quickPrompts.map((prompt) => {
            const IconComponent = prompt.icon;
            return (
              <TouchableOpacity
                key={prompt.id}
                style={styles.promptButton}
                onPress={() => handleQuickPrompt(prompt.text)}
                disabled={isSending || isUploading}
              >
                <IconComponent size={20} color={prompt.color} />
                <Text style={styles.promptText}>{prompt.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    ),
    [handleQuickPrompt, isSending, isUploading]
  );

  // Loading state for initial load
  if (isLoadingMessages && !showSubjects && allMessages.length === 0) {
    return (
      <SafeAreaWrapper style={styles.container}>
        <ChatHeader
          subject={selectedSubject}
          onSubjectChange={handleBackToSubjects}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary[600]} />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      </SafeAreaWrapper>
    );
  }

  // Error state
  if (messagesError && !showSubjects) {
    return (
      <SafeAreaWrapper style={styles.container}>
        <ChatHeader
          subject={selectedSubject}
          onSubjectChange={handleBackToSubjects}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load messages</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refetchMessages()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper style={styles.container}>
      <ChatHeader
        subject={selectedSubject}
        onSubjectChange={handleBackToSubjects}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 104}
      >
        {showSubjects ? (
          subjectSelector
        ) : (
          <>
            {allMessages.length <= 1 ? (
              <ChatEmpty />
            ) : (
              <>
                <ChatMessages
                  messages={allMessages}
                  onFeedback={handleFeedback}
                  isLoadingMore={isLoadingMessages}
                />
                {quickPromptsComponent}
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
              disabled={isSending || isUploading || isLoadingMessages}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.neutral[600],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error[600],
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.primary[600],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
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
