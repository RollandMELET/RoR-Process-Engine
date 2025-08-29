// RoR Process Engine - Core Engine
// Generic JSON-driven process execution engine

import { 
  ProcessDefinition, 
  ProcessState, 
  ProcessStep,
  ValidationResult,
  NavigationResult,
  StepResponse,
  RandomizedQuestionData,
  Question
} from '../types/ProcessEngine.types';

export class ProcessEngine {
  private state: ProcessState;
  private listeners: Set<(state: ProcessState) => void> = new Set();

  constructor() {
    this.state = this.getInitialState();
  }

  private getInitialState(): ProcessState {
    return {
      currentProcess: null,
      currentStepIndex: 0,
      currentStep: null,
      stepResponses: new Map(),
      questionResponses: {},
      captureValues: {},
      introResponse: null,
      questionMode: 'ok-only', // Default mode as per specification
      randomizedQuestionsData: new Map(),
      currentScreen: 'home',
      pieceStatus: null,
    };
  }

  // State Management
  subscribe(listener: (state: ProcessState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private setState(updates: Partial<ProcessState>): void {
    this.state = { ...this.state, ...updates };
    this.listeners.forEach(listener => listener(this.state));
  }

  getState(): ProcessState {
    return { ...this.state };
  }

  // Process Management
  loadProcess(processDefinition: ProcessDefinition): void {
    this.setState({
      currentProcess: processDefinition,
      currentStepIndex: 0,
      currentStep: processDefinition.processSteps[0] || null,
      stepResponses: new Map(),
      questionResponses: {},
      captureValues: {},
      randomizedQuestionsData: new Map(),
      pieceStatus: null,
    });

    // Initialize questions for first step if it has any
    const firstStep = processDefinition.processSteps[0];
    if (firstStep?.questions && firstStep.questions.length > 0) {
      this.initializeStepQuestions(firstStep.stepId, firstStep.questions);
    }
  }

  // Navigation
  navigateToStep(stepIndex: number): boolean {
    const process = this.state.currentProcess;
    if (!process || stepIndex < 0 || stepIndex >= process.processSteps.length) {
      return false;
    }

    const targetStep = process.processSteps[stepIndex];
    
    this.setState({
      currentStepIndex: stepIndex,
      currentStep: targetStep,
      questionResponses: {},
      captureValues: {},
      introResponse: null,
    });

    // Initialize questions for the new step
    if (targetStep.questions && targetStep.questions.length > 0) {
      this.initializeStepQuestions(targetStep.stepId, targetStep.questions);
    }

    return true;
  }

  navigateToNextStep(): NavigationResult {
    const process = this.state.currentProcess;
    const currentStep = this.state.currentStep;
    
    if (!process || !currentStep) {
      return { nextStepIndex: null, shouldMarkRebut: false };
    }

    // Validate current step before navigation
    const validation = this.validateCurrentStep();
    if (!validation.isValid) {
      return { 
        nextStepIndex: null, 
        shouldMarkRebut: false,
        message: `Validation failed: ${validation.errors.join(', ')}`
      };
    }

    // Save current step response
    this.saveCurrentStepResponse();

    // Apply navigation logic
    const navigationResult = this.executeNavigationLogic(currentStep);
    
    if (navigationResult.nextStepIndex !== null) {
      this.navigateToStep(navigationResult.nextStepIndex);
    }

    return navigationResult;
  }

  // Question System
  private initializeStepQuestions(stepId: string, questions: Question[]): void {
    const questionMode = this.state.questionMode;
    
    // Create randomized data for each question
    const randomData: RandomizedQuestionData[] = questions.map((_, index) => ({
      originalIndex: index,
      showOkVersion: questionMode === 'ok-only' ? true : Math.random() > 0.5,
      shuffledPosition: index
    }));

    // Fisher-Yates shuffle for question order
    for (let i = randomData.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tempPos = randomData[i].shuffledPosition;
      randomData[i].shuffledPosition = randomData[j].shuffledPosition;  
      randomData[j].shuffledPosition = tempPos;
    }

    // Sort by shuffled position
    randomData.sort((a, b) => a.shuffledPosition - b.shuffledPosition);

    // Update randomized data
    const newRandomizedData = new Map(this.state.randomizedQuestionsData);
    newRandomizedData.set(stepId, randomData);
    
    this.setState({ randomizedQuestionsData: newRandomizedData });
  }

  setQuestionMode(mode: 'ok-only' | 'ok-ko-random'): void {
    this.setState({ questionMode: mode });
    
    // Re-initialize questions for current step if it has questions
    const currentStep = this.state.currentStep;
    if (currentStep?.questions && currentStep.questions.length > 0) {
      this.initializeStepQuestions(currentStep.stepId, currentStep.questions);
    }
  }

  setQuestionResponse(questionId: string, value: 'ok' | 'ko'): void {
    this.setState({
      questionResponses: {
        ...this.state.questionResponses,
        [questionId]: value
      }
    });
  }

  // Validation Engine
  validateCurrentStep(): ValidationResult {
    const currentStep = this.state.currentStep;
    const process = this.state.currentProcess;
    
    if (!currentStep || !process) {
      return { isValid: false, errors: ['No current step'] };
    }

    const errors: string[] = [];
    
    // Validate intro response if step has intro
    if (currentStep.intro && currentStep.stepType !== 'PointArret') {
      if (this.state.introResponse === null) {
        errors.push('Intro question not answered');
      }
    }

    // Validate questions if step has questions
    if (currentStep.questions && currentStep.questions.length > 0) {
      const randomizedData = this.state.randomizedQuestionsData.get(currentStep.stepId);
      
      if (randomizedData && randomizedData.length > 0) {
        // Validate based on randomization pattern
        randomizedData.forEach((data) => {
          const response = this.state.questionResponses[`q_${data.originalIndex}`];
          
          if (!response) {
            errors.push(`Question ${data.originalIndex + 1} not answered`);
          } else {
            const expectedAnswer = data.showOkVersion ? 'ok' : 'ko';
            if (response !== expectedAnswer) {
              errors.push(`Question ${data.originalIndex + 1}: incorrect response`);
            }
          }
        });
      } else {
        // Fallback validation
        currentStep.questions.forEach((_, index) => {
          const response = this.state.questionResponses[`q_${index}`];
          if (!response) {
            errors.push(`Question ${index + 1} not answered`);
          } else if (this.state.questionMode === 'ok-only' && response !== 'ok') {
            errors.push(`Question ${index + 1}: must be OK in ok-only mode`);
          }
        });
      }
    }

    // Validate capture fields
    this.validateCaptureFields(currentStep, errors);

    // Apply step-specific validation rules
    this.applyStepValidationRules(currentStep, errors);

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private validateCaptureFields(step: ProcessStep, errors: string[]): void {
    if (!step.captureUser) return;

    Object.entries(step.captureUser).forEach(([fieldName, fieldConfig]) => {
      // Skip metadata fields (starting with _)
      if (fieldName.startsWith('_')) return;

      const value = this.state.captureValues[fieldName];
      const config = typeof fieldConfig === 'string' ? null : fieldConfig;

      // Check required fields
      if (config?.validation?.required && (!value || value.trim() === '')) {
        errors.push(`${fieldName} is required`);
        return;
      }

      // Check conditional requirements
      if (config?.validation?.conditional) {
        const dependsOnValue = this.state.captureValues[config.validation.conditional.dependsOn];
        if (dependsOnValue === config.validation.conditional.value) {
          if (!value || value.trim() === '') {
            errors.push(`${fieldName} is required when ${config.validation.conditional.dependsOn} = ${config.validation.conditional.value}`);
          }
        }
      }
    });
  }

  private applyStepValidationRules(step: ProcessStep, errors: string[]): void {
    // Apply generic validation rules defined in step.validation
    if (!step.validation?.conditionalFields) return;

    step.validation.conditionalFields.forEach(rule => {
      // Parse and apply conditional validation rules
      // This would interpret the condition string and check requirements
      // Implementation would be based on the specific rule format
    });
  }

  // Navigation Logic Engine
  private executeNavigationLogic(step: ProcessStep): NavigationResult {
    const result: NavigationResult = {
      nextStepIndex: null,
      shouldMarkRebut: false,
    };

    // Check for conditional navigation rules
    if (step.navigation?.conditionalNext) {
      for (const condition of step.navigation.conditionalNext) {
        if (this.evaluateCondition(condition.condition)) {
          const targetStep = this.findStepById(condition.nextStepId);
          if (targetStep) {
            result.nextStepIndex = targetStep.index;
            result.message = condition.message;
            
            if (condition.action === 'reject') {
              result.shouldMarkRebut = true;
              result.nextStepIndex = null;
            }
            return result;
          }
        }
      }
    }

    // Default navigation
    if (step.navigation?.defaultNext) {
      const targetStep = this.findStepById(step.navigation.defaultNext);
      if (targetStep) {
        result.nextStepIndex = targetStep.index;
      }
    } else {
      // Sequential navigation
      const currentIndex = this.state.currentStepIndex;
      const maxIndex = (this.state.currentProcess?.processSteps.length || 1) - 1;
      result.nextStepIndex = currentIndex < maxIndex ? currentIndex + 1 : null;
    }

    return result;
  }

  private evaluateCondition(condition: string): boolean {
    // Simple condition parser
    // Format: "fieldName=value" or "fieldName!=value"
    const operators = ['!=', '='];
    
    for (const op of operators) {
      if (condition.includes(op)) {
        const [fieldName, expectedValue] = condition.split(op);
        const actualValue = this.state.captureValues[fieldName.trim()];
        
        switch (op) {
          case '=':
            return actualValue === expectedValue.trim();
          case '!=':
            return actualValue !== expectedValue.trim();
        }
      }
    }
    
    return false;
  }

  private findStepById(stepId: string): { step: ProcessStep; index: number } | null {
    const process = this.state.currentProcess;
    if (!process) return null;

    const index = process.processSteps.findIndex(step => step.stepId === stepId);
    if (index === -1) return null;

    return {
      step: process.processSteps[index],
      index
    };
  }

  // Data Management
  setCaptureValue(fieldName: string, value: any): void {
    this.setState({
      captureValues: {
        ...this.state.captureValues,
        [fieldName]: value
      }
    });
  }

  setIntroResponse(response: boolean): void {
    this.setState({ introResponse: response });
  }

  private saveCurrentStepResponse(): void {
    const currentStep = this.state.currentStep;
    if (!currentStep) return;

    const stepResponse: StepResponse = {
      stepId: currentStep.stepId,
      questionResponses: { ...this.state.questionResponses },
      userInputs: { ...this.state.captureValues },
      systemData: {
        timestamp: new Date(),
        // Additional system data would be populated here
      },
    };

    const newResponses = new Map(this.state.stepResponses);
    newResponses.set(currentStep.stepId, stepResponse);
    
    this.setState({ stepResponses: newResponses });
  }

  // Integration Hooks (prepared for future implementation)
  async executeHook(hookName: string, data: any): Promise<any> {
    const currentStep = this.state.currentStep;
    if (!currentStep?.hooks) return null;

    const hookDefinition = currentStep.hooks[hookName as keyof typeof currentStep.hooks];
    if (!hookDefinition) return null;

    // Future implementation: parse hookDefinition and execute
    // Format: "service:method" e.g., "360sc:updateStatus"
    console.log(`Hook execution prepared: ${hookDefinition}`, data);
    
    return null;
  }

  // Screen Navigation
  navigateToScreen(screen: string): void {
    this.setState({ currentScreen: screen as any });
  }

  // Reset
  reset(): void {
    this.setState(this.getInitialState());
  }

  // Getters
  getCurrentStep(): ProcessStep | null {
    return this.state.currentStep;
  }

  getCurrentProcess(): ProcessDefinition | null {
    return this.state.currentProcess;
  }

  getRandomizedQuestions(stepId: string): RandomizedQuestionData[] | undefined {
    return this.state.randomizedQuestionsData.get(stepId);
  }

  getStepResponse(stepId: string): StepResponse | undefined {
    return this.state.stepResponses.get(stepId);
  }

  // Utility Methods
  canNavigateNext(): boolean {
    return this.validateCurrentStep().isValid;
  }

  getProcessProgress(): { current: number; total: number; percentage: number } {
    const process = this.state.currentProcess;
    if (!process) return { current: 0, total: 0, percentage: 0 };

    const current = this.state.currentStepIndex + 1;
    const total = process.processSteps.length;
    const percentage = Math.round((current / total) * 100);

    return { current, total, percentage };
  }
}