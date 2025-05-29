import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  Platform,
} from 'react-native';
import Colors from '@/constants/Colors';
import { Send, Mic, Image, File, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

interface ChatInputProps {
  onSendText: (text: string) => void;
  onSendFile?: (file: any, type: 'image' | 'pdf') => void;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  isRecording?: boolean;
  isLoading?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendText,
  onSendFile,
  onStartRecording,
  onStopRecording,
  isRecording = false,
  isLoading = false,
}) => {
  const [text, setText] = useState('');
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleSend = () => {
    if (text.trim() && !isLoading) {
      onSendText(text.trim());
      setText('');
      Keyboard.dismiss();
    }
  };

  const handleRecording = () => {
    if (isRecording) {
      onStopRecording?.();
    } else {
      onStartRecording?.();
    }
  };

  const pickImage = async () => {
    setIsAttachmentMenuOpen(false);
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      onSendFile?.(result.assets[0], 'image');
    }
  };

  const pickDocument = async () => {
    setIsAttachmentMenuOpen(false);
    
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });

    if (result.canceled === false && result.assets && result.assets.length > 0) {
      onSendFile?.(result.assets[0], 'pdf');
    }
  };

  return (
    <View style={styles.container}>
      {isAttachmentMenuOpen && (
        <View style={styles.attachmentMenu}>
          <TouchableOpacity style={styles.attachmentOption} onPress={pickImage}>
            <View style={[styles.attachmentIcon, { backgroundColor: Colors.primary[100] }]}>
              <Image size={24} color={Colors.primary[600]} />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.attachmentOption} onPress={pickDocument}>
            <View style={[styles.attachmentIcon, { backgroundColor: Colors.secondary[100] }]}>
              <File size={24} color={Colors.secondary[600]} />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.closeAttachment}
            onPress={() => setIsAttachmentMenuOpen(false)}
          >
            <X size={20} color={Colors.neutral[500]} />
          </TouchableOpacity>
        </View>
      )}
      
      <View style={styles.inputContainer}>
        <TouchableOpacity 
          style={styles.attachButton}
          onPress={() => setIsAttachmentMenuOpen(!isAttachmentMenuOpen)}
        >
          <Image size={24} color={Colors.neutral[500]} />
        </TouchableOpacity>
        
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Ask a question..."
          value={text}
          onChangeText={setText}
          multiline
          editable={!isLoading}
          maxLength={500}
        />
        
        {text.trim() ? (
          <TouchableOpacity 
            style={[styles.sendButton, isLoading && styles.disabledButton]}
            onPress={handleSend}
            disabled={isLoading}
          >
            <Send size={20} color={isLoading ? Colors.neutral[400] : Colors.white} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[
              styles.micButton,
              isRecording && styles.recordingButton,
            ]}
            onPress={handleRecording}
          >
            <Mic size={20} color={isRecording ? Colors.white : Colors.neutral[600]} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
    backgroundColor: Colors.white,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[100],
    borderRadius: 24,
    paddingHorizontal: 12,
  },
  attachButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    color: Colors.neutral[800],
  },
  sendButton: {
    backgroundColor: Colors.primary[500],
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: Colors.neutral[300],
  },
  micButton: {
    backgroundColor: Colors.neutral[200],
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingButton: {
    backgroundColor: Colors.error[500],
  },
  attachmentMenu: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  attachmentOption: {
    marginRight: 16,
    alignItems: 'center',
  },
  attachmentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeAttachment: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 8,
  },
});

export default ChatInput;