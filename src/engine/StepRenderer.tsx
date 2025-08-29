// RoR Process Engine - Dynamic Step Renderer
// Replaces all hardcoded step templates with JSON-driven UI generation

import React from 'react';
import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import { ProcessStep, ProcessDefinition } from '../types/ProcessEngine.types';
import { DynamicQuestionBlock } from '../components/DynamicQuestionBlock';
import { DynamicCaptureForm } from '../components/DynamicCaptureForm'; 
import { DynamicValidationPanel } from '../components/DynamicValidationPanel';
import { DynamicActionButton } from '../components/DynamicActionButton';
import { DynamicIntroQuestion } from '../components/DynamicIntroQuestion';
import { StepHeader } from '../components/StepHeader';
import { ActionBar } from '../components/ActionBar';

interface StepRendererProps {
  step: ProcessStep;
  process: ProcessDefinition;
  stepIndex: number;
  
  // State
  introResponse: boolean | null;
  questionResponses: Record<string, 'ok' | 'ko'>;
  captureValues: Record<string, any>;
  
  // Callbacks
  onIntroResponse: (response: boolean) => void;
  onQuestionResponse: (questionId: string, value: 'ok' | 'ko') => void;
  onCaptureChange: (fieldName: string, value: any) => void;
  onValidate: () => void;
  onBack: () => void;
  
  // Validation
  isValid: boolean;
  errors: string[];
}

export const StepRenderer: React.FC<StepRendererProps> = ({
  step,
  process,
  stepIndex,
  introResponse,
  questionResponses,
  captureValues,
  onIntroResponse,
  onQuestionResponse,
  onCaptureChange,
  onValidate,
  onBack,
  isValid,
  errors
}) => {
  
  // Determine what to render based on step state and type
  const renderStepContent = () => {
    // If step has intro and not answered yet
    if (step.intro && introResponse === null && step.stepType !== 'PointArret') {
      return (
        <DynamicIntroQuestion
          question={step.intro}
          onResponse={onIntroResponse}
        />
      );
    }

    // If intro was answered NO, show skip option
    if (step.intro && introResponse === false && step.stepType !== 'PointArret') {
      return (
        <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
          <View style={{
            backgroundColor: 'white',
            padding: 24,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#E0E0E0',
          }}>
            <Text style={{
              fontSize: 18,
              textAlign: 'center',
              color: '#757575',
              marginBottom: 24,
            }}>
              Please prepare before continuing
            </Text>
            <DynamicActionButton
              title="SKIP TO NEXT STEP"
              onPress={onValidate}
              variant="primary"
            />
          </View>
        </View>
      );
    }

    // Main step content based on step type
    return (
      <ScrollView style={{ flex: 1 }}>
        {renderByStepType()}
      </ScrollView>
    );
  };

  const renderByStepType = () => {
    switch (step.stepType) {
      case 'PointControle':
        return (
          <>
            {step.questions && (
              <DynamicQuestionBlock
                questions={step.questions}
                responses={questionResponses}
                onResponseChange={onQuestionResponse}
                stepId={step.stepId}
              />
            )}
          </>
        );

      case 'PointControleSpecial':
        return (
          <>
            {step.questions && (
              <DynamicQuestionBlock
                questions={step.questions}
                responses={questionResponses}
                onResponseChange={onQuestionResponse}
                stepId={step.stepId}
              />
            )}
            
            {step.captureUser && (
              <DynamicCaptureForm
                fields={step.captureUser}
                values={captureValues}
                onValueChange={onCaptureChange}
              />
            )}
          </>
        );

      case 'PointArret':
        return (
          <DynamicValidationPanel
            step={step}
            captureValues={captureValues}
            onValueChange={onCaptureChange}
            requiresSupervisor={step.validation?.requiresSupervisor || true}
          />
        );

      case 'PointSynchronisation':
        return (
          <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>
              {step.stepName}
            </Text>
            <Text style={{ fontSize: 16, color: '#757575' }}>
              Synchronization step - Implementation pending
            </Text>
          </View>
        );

      default:
        return (
          <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 16, color: '#E53E3E' }}>
              Unknown step type: {step.stepType}
            </Text>
          </View>
        );
    }
  };

  const renderActionButton = () => {
    // Don't show action button if intro not answered yet
    if (step.intro && introResponse === null && step.stepType !== 'PointArret') {
      return null;
    }

    // Don't show if intro answered NO
    if (step.intro && introResponse === false && step.stepType !== 'PointArret') {
      return null;
    }

    const buttonTitle = step.stepType === 'PointArret' 
      ? 'CONFIRM DECISION' 
      : 'VALIDATE STEP';

    return (
      <View style={{
        backgroundColor: 'white',
        paddingVertical: 20,
        paddingHorizontal: 40,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
      }}>
        <DynamicActionButton
          title={buttonTitle}
          onPress={onValidate}
          disabled={!isValid}
          variant={isValid ? 'primary' : 'disabled'}
        />
        
        {errors.length > 0 && (
          <View style={{ marginTop: 10 }}>
            {errors.map((error, index) => (
              <Text key={index} style={{ color: '#E53E3E', fontSize: 14 }}>
                • {error}
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderActionBar = () => {
    const actionBarConfig = step.actionBar || {
      photo: { enabled: true },
      note: { enabled: true },
      notification: { enabled: true },
      documentation: { enabled: true }
    };

    return (
      <ActionBar
        config={actionBarConfig}
        onBackPress={onBack}
        onPhotoPress={() => console.log('Photo action - Hook:', actionBarConfig.photo?.hook)}
        onNotePress={() => console.log('Note action - Hook:', actionBarConfig.note?.hook)}
        onNotificationPress={() => console.log('Notification action - Hook:', actionBarConfig.notification?.hook)}
        onDocumentationPress={() => console.log('Documentation action - Hook:', actionBarConfig.documentation?.hook)}
      />
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <View style={{ flex: 1 }}>
        {/* Dynamic Step Header */}
        <StepHeader
          step={step}
          process={process}
          stepIndex={stepIndex}
        />

        {/* Dynamic Step Content */}
        <View style={{ flex: 1 }}>
          {renderStepContent()}
        </View>

        {/* Dynamic Action Button */}
        {renderActionButton()}

        {/* Dynamic Action Bar */}
        {renderActionBar()}
      </View>
    </SafeAreaView>
  );
};