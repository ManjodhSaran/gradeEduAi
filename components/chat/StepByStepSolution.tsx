import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Colors from '@/constants/Colors';
import { CheckCircle2, Circle, ChevronRight } from 'lucide-react-native';

interface Step {
  id: string;
  content: string;
  options?: string[];
  correctOption?: number;
}

interface StepByStepSolutionProps {
  steps: Step[];
  currentStep: number;
  onAnswerSubmit: (stepId: string, answer: number) => void;
  isLoading?: boolean;
}

export default function StepByStepSolution({
  steps,
  currentStep,
  onAnswerSubmit,
  isLoading,
}: StepByStepSolutionProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({});
  const [submittedSteps, setSubmittedSteps] = useState<string[]>([]);

  const handleOptionSelect = (stepId: string, optionIndex: number) => {
    if (submittedSteps.includes(stepId)) return;
    setSelectedOptions(prev => ({ ...prev, [stepId]: optionIndex }));
  };

  const handleSubmit = (stepId: string) => {
    if (!selectedOptions[stepId] && selectedOptions[stepId] !== 0) return;
    onAnswerSubmit(stepId, selectedOptions[stepId]);
    setSubmittedSteps(prev => [...prev, stepId]);
  };

  const isStepCompleted = (stepId: string) => submittedSteps.includes(stepId);
  const isStepCurrent = (index: number) => index === currentStep;

  return (
    <View style={styles.container}>
      {steps.map((step, index) => (
        <View
          key={step.id}
          style={[
            styles.stepContainer,
            isStepCompleted(step.id) && styles.completedStep,
            isStepCurrent(index) && styles.currentStep,
          ]}
        >
          <View style={styles.stepHeader}>
            <View style={styles.stepNumberContainer}>
              {isStepCompleted(step.id) ? (
                <CheckCircle2 size={24} color={Colors.success[500]} />
              ) : (
                <Circle size={24} color={Colors.neutral[400]} />
              )}
              <Text style={styles.stepNumber}>Step {index + 1}</Text>
            </View>
          </View>

          <Text style={styles.stepContent}>{step.content}</Text>

          {step.options && (
            <View style={styles.optionsContainer}>
              {step.options.map((option, optionIndex) => (
                <TouchableOpacity
                  key={optionIndex}
                  style={[
                    styles.option,
                    selectedOptions[step.id] === optionIndex && styles.selectedOption,
                    isStepCompleted(step.id) && 
                      optionIndex === step.correctOption && 
                      styles.correctOption,
                  ]}
                  onPress={() => handleOptionSelect(step.id, optionIndex)}
                  disabled={isStepCompleted(step.id) || !isStepCurrent(index)}
                >
                  <Text style={[
                    styles.optionText,
                    selectedOptions[step.id] === optionIndex && styles.selectedOptionText,
                    isStepCompleted(step.id) && 
                      optionIndex === step.correctOption && 
                      styles.correctOptionText,
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {isStepCurrent(index) && !isStepCompleted(step.id) && (
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!selectedOptions[step.id] && selectedOptions[step.id] !== 0) && styles.disabledButton,
              ]}
              onPress={() => handleSubmit(step.id)}
              disabled={!selectedOptions[step.id] && selectedOptions[step.id] !== 0}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>Submit Answer</Text>
                  <ChevronRight size={20} color={Colors.white} />
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  stepContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  completedStep: {
    borderColor: Colors.success[200],
    backgroundColor: Colors.success[50],
  },
  currentStep: {
    borderColor: Colors.primary[300],
    borderWidth: 2,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral[700],
  },
  stepContent: {
    fontSize: 16,
    color: Colors.neutral[800],
    lineHeight: 24,
    marginBottom: 16,
  },
  optionsContainer: {
    marginTop: 12,
  },
  option: {
    backgroundColor: Colors.neutral[100],
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  selectedOption: {
    backgroundColor: Colors.primary[100],
    borderColor: Colors.primary[300],
  },
  correctOption: {
    backgroundColor: Colors.success[100],
    borderColor: Colors.success[300],
  },
  optionText: {
    fontSize: 16,
    color: Colors.neutral[700],
  },
  selectedOptionText: {
    color: Colors.primary[700],
    fontWeight: '500',
  },
  correctOptionText: {
    color: Colors.success[700],
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: Colors.primary[500],
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  disabledButton: {
    backgroundColor: Colors.neutral[300],
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});