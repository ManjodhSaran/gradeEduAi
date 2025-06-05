import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  TextInput,
} from 'react-native';
import Colors from '@/constants/Colors';
import { Camera, Image, Mic, Send, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

interface ProblemInputProps {
  onSubmit: (data: { type: 'text' | 'image' | 'audio', content: string, file?: any }) => void;
  isLoading?: boolean;
}

export default function ProblemInput({ onSubmit, isLoading }: ProblemInputProps) {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showInputOptions, setShowInputOptions] = useState(false);

  const handleTextSubmit = () => {
    if (!text.trim() || isLoading) return;
    onSubmit({ type: 'text', content: text.trim() });
    setText('');
    setShowInputOptions(false);
  };

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      onSubmit({
        type: 'image',
        content: 'Image problem submission',
        file: result.assets[0]
      });
      setShowInputOptions(false);
    }
  };

  const handleCameraCapture = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      onSubmit({
        type: 'image',
        content: 'Camera capture submission',
        file: result.assets[0]
      });
      setShowInputOptions(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording and submit
      setIsRecording(false);
      // Add actual audio recording implementation
      onSubmit({
        type: 'audio',
        content: 'Audio problem submission',
        // Add actual audio file
      });
    } else {
      setIsRecording(true);
      // Start recording
    }
    setShowInputOptions(false);
  };

  return (
    <View style={styles.container}>
      {showInputOptions && (
        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.option} onPress={handleImagePick}>
            <Image size={24} color={Colors.primary[600]} />
            <Text style={styles.optionText}>Upload Image</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.option} onPress={handleCameraCapture}>
            <Camera size={24} color={Colors.secondary[600]} />
            <Text style={styles.optionText}>Take Photo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.option} onPress={toggleRecording}>
            <Mic size={24} color={Colors.accent[600]} />
            <Text style={styles.optionText}>Record Audio</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowInputOptions(false)}
          >
            <X size={20} color={Colors.neutral[500]} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowInputOptions(!showInputOptions)}
        >
          <Image size={24} color={Colors.neutral[500]} />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Type your problem here..."
          value={text}
          onChangeText={setText}
          multiline
          maxLength={1000}
          editable={!isLoading}
        />

        {text.trim() ? (
          <TouchableOpacity
            style={[styles.sendButton, isLoading && styles.disabledButton]}
            onPress={handleTextSubmit}
            disabled={isLoading}
          >
            <Send size={20} color={isLoading ? Colors.neutral[400] : Colors.white} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.micButton, isRecording && styles.recordingButton]}
            onPress={toggleRecording}
          >
            <Mic
              size={20}
              color={isRecording ? Colors.white : Colors.neutral[600]}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
    backgroundColor: Colors.white,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  option: {
    alignItems: 'center',
  },
  optionText: {
    marginTop: 4,
    fontSize: 12,
    color: Colors.neutral[700],
  },
  closeButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    padding: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[100],
    borderRadius: 24,
    paddingHorizontal: 12,
  },
  addButton: {
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
});