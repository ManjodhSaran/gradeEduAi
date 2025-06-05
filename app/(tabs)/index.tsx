import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Text,
} from 'react-native';
import { SafeAreaWrapper } from '@/components/layout/SafeAreaWrapper';
import Colors from '@/constants/Colors';
import { useApiMutation } from '@/hooks/useApi';
import ProblemInput from '@/components/chat/ProblemInput';
import StepByStepSolution from '@/components/chat/StepByStepSolution';

interface Step {
  id: string;
  content: string;
  options?: string[];
  correctOption?: number;
}

interface Problem {
  id: string;
  type: 'text' | 'image' | 'audio';
  content: string;
  steps: Step[];
}

export default function HomeScreen() {
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const { mutate: submitProblem, isPending: isSubmitting } = useApiMutation('/problems', {
    onSuccess: (data: Problem) => {
      setCurrentProblem(data);
      setCurrentStep(0);
    },
  });

  const { mutate: submitAnswer, isPending: isAnswering } = useApiMutation('/problems/answer', {
    onSuccess: () => {
      if (currentProblem && currentStep < currentProblem.steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      }
    },
  });

  const handleProblemSubmit = useCallback(async (data: { type: 'text' | 'image' | 'audio', content: string, file?: any }) => {
    const formData = new FormData();
    formData.append('type', data.type);
    formData.append('content', data.content);

    if (data.file) {
      const fileUri = data.file.uri;
      const filename = fileUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image';

      formData.append('file', {
        uri: fileUri,
        name: filename,
        type,
      } as any);
    }

    submitProblem(formData);
  }, [submitProblem]);

  const handleAnswerSubmit = useCallback((stepId: string, answer: number) => {
    if (!currentProblem) return;

    submitAnswer({
      problemId: currentProblem.id,
      stepId,
      answer,
    });
  }, [currentProblem, submitAnswer]);

  return (
    <SafeAreaWrapper style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 104}
      >
        {isSubmitting ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary[500]} />
            <Text style={styles.loadingText}>Analyzing your problem...</Text>
          </View>
        ) : currentProblem ? (
          <StepByStepSolution
            steps={currentProblem.steps}
            currentStep={currentStep}
            onAnswerSubmit={handleAnswerSubmit}
            isLoading={isAnswering}
          />
        ) : (
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>Welcome to Step-by-Step Learning!</Text>
            <Text style={styles.welcomeText}>
              Submit your problem through text, image, or voice recording, and I'll help you solve it step by step.
            </Text>
          </View>
        )}

        <ProblemInput
          onSubmit={handleProblemSubmit}
          isLoading={isSubmitting}
        />
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
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
    textAlign: 'center',
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary[700],
    marginBottom: 16,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: Colors.neutral[600],
    textAlign: 'center',
    lineHeight: 24,
  },
});