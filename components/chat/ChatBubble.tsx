import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '@/constants/Colors';
import { ThumbsUp, ThumbsDown } from 'lucide-react-native';

interface ChatBubbleProps {
  content: string;
  isUser?: boolean;
  timestamp?: string;
  showFeedback?: boolean;
  onFeedback?: (isPositive: boolean) => void;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  content,
  isUser = false,
  timestamp,
  showFeedback = false,
  onFeedback,
}) => {
  return (
    <View style={[
      styles.container,
      isUser ? styles.userContainer : styles.aiContainer,
    ]}>
      <View style={[
        styles.bubble,
        isUser ? styles.userBubble : styles.aiBubble,
      ]}>
        <Text style={[
          styles.text,
          isUser ? styles.userText : styles.aiText,
        ]}>
          {content}
        </Text>
      </View>
      
      <View style={styles.metaContainer}>
        {timestamp && (
          <Text style={styles.timestamp}>
            {timestamp}
          </Text>
        )}
        
        {showFeedback && !isUser && (
          <View style={styles.feedbackContainer}>
            <TouchableOpacity 
              style={styles.feedbackButton}
              onPress={() => onFeedback && onFeedback(true)}
            >
              <ThumbsUp size={16} color={Colors.neutral[500]} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.feedbackButton}
              onPress={() => onFeedback && onFeedback(false)}
            >
              <ThumbsDown size={16} color={Colors.neutral[500]} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    maxWidth: '80%',
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  aiContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: 16,
    padding: 12,
    minHeight: 40,
  },
  userBubble: {
    backgroundColor: Colors.primary[500],
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: Colors.neutral[200],
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: Colors.white,
  },
  aiText: {
    color: Colors.neutral[800],
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.neutral[500],
  },
  feedbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedbackButton: {
    padding: 6,
    marginLeft: 8,
  },
});

export default ChatBubble;