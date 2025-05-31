import React, { useRef, useEffect } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import ChatBubble from './ChatBubble';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
  showFeedback?: boolean;
}

interface ChatMessagesProps {
  messages: Message[];
  onFeedback?: (isPositive: boolean, messageId: string) => void;
}

export default function ChatMessages({ messages, onFeedback }: ChatMessagesProps) {
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const renderItem = ({ item }: { item: Message }) => (
    <ChatBubble
      content={item.content}
      isUser={item.isUser}
      timestamp={item.timestamp}
      showFeedback={item.showFeedback}
      onFeedback={(isPositive) => onFeedback?.(isPositive, item.id)}
    />
  );

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.messageList}
      onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
    />
  );
}

const styles = StyleSheet.create({
  messageList: {
    padding: 16,
  },
});