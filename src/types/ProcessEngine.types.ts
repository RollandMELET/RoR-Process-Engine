// RoR Process Engine - Type Definitions
// Generic types for JSON-driven process workflows

export interface ProcessMetadata {
  processType: string;
  version: string;
  ref: string;
  integrations?: IntegrationConfig;
}

export interface IntegrationConfig {
  '360sc'?: {
    enabled: boolean;
    apiUrl?: string;
    apiKey?: string;
  };
  urrats?: {
    enabled: boolean;
    webhookUrl?: string;
  };
  n8n?: {
    enabled: boolean;
    workflowId?: string;
  };
}

export interface ProcessCaptureSystem {
  pieceId?: string;
  mouldId?: string;
  [key: string]: any;
}

export interface ProcessStep {
  stepId: string;
  stepName: string;
  stepType: 'PointControle' | 'PointControleSpecial' | 'PointArret' | 'PointSynchronisation';
  intro?: string | null;
  questions?: Question[] | null;
  captureUser?: CaptureUserConfig;
  validation?: ValidationConfig;
  navigation?: NavigationConfig;
  hooks?: HookConfig;
  actionBar?: ActionBarConfig;
}

export interface Question {
  ok: string;
  ko: string;
}

export interface CaptureUserConfig {
  [fieldName: string]: string | FieldConfig;
}

export interface FieldConfig {
  value?: string;
  type?: 'text' | 'binary' | 'scan' | 'auto' | 'timestamp';
  options?: string[];
  validation?: {
    required?: boolean;
    conditional?: {
      dependsOn: string;
      value: string;
    };
  };
}

export interface ValidationConfig {
  requiresSupervisor?: boolean;
  conditionalFields?: ConditionalField[];
}

export interface ConditionalField {
  fieldName: string;
  condition: string;
  requiredWhen: string;
}

export interface NavigationConfig {
  conditionalNext?: ConditionalNavigation[];
  defaultNext?: string;
}

export interface ConditionalNavigation {
  condition: string;
  nextStepId: string;
  action: 'continue' | 'skip' | 'end' | 'reject';
  message?: string;
}

export interface HookConfig {
  onEnter?: string;
  onValidate?: string;
  onComplete?: string;
  onReject?: string;
}

export interface ActionBarConfig {
  photo?: ActionConfig;
  note?: ActionConfig;
  notification?: ActionConfig;
  documentation?: ActionConfig;
}

export interface ActionConfig {
  enabled: boolean;
  hook?: string;
}

// Process Definition Root Interface
export interface ProcessDefinition {
  metadata: ProcessMetadata;
  captureSystem: ProcessCaptureSystem;
  processSteps: ProcessStep[];
}

// Engine State Interfaces
export interface ProcessState {
  currentProcess: ProcessDefinition | null;
  currentStepIndex: number;
  currentStep: ProcessStep | null;
  
  // User interactions
  stepResponses: Map<string, StepResponse>;
  questionResponses: Record<string, 'ok' | 'ko'>;
  captureValues: Record<string, any>;
  introResponse: boolean | null;
  
  // Question system
  questionMode: 'ok-only' | 'ok-ko-random';
  randomizedQuestionsData: Map<string, RandomizedQuestionData[]>;
  
  // Navigation state
  currentScreen: ScreenType;
  pieceStatus: 'CONFORME' | 'REBUT' | null;
  
  // Integration state (prepared for future)
  integrationContext?: IntegrationContext;
}

export interface StepResponse {
  stepId: string;
  questionResponses: Record<string, 'ok' | 'ko'>;
  userInputs: Record<string, any>;
  systemData: {
    userId?: string;
    userRole?: string;
    timestamp: Date;
    location?: string;
  };
  integrationData?: any;
}

export interface RandomizedQuestionData {
  originalIndex: number;
  showOkVersion: boolean;
  shuffledPosition: number;
}

export type ScreenType = 
  | 'home' 
  | 'process-selection' 
  | 'process' 
  | 'bl-beton'
  | 'scan';

export interface IntegrationContext {
  user?: {
    id: string;
    role: string;
    permissions: string[];
  };
  object?: {
    uuid: string;
    status: string;
    metadata: any;
  };
  session?: {
    id: string;
    startTime: Date;
    lastSync?: Date;
  };
}

// Engine Action Interfaces
export interface EngineAction {
  type: string;
  payload: any;
  metadata?: {
    stepId: string;
    processType: string;
    timestamp: Date;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
  nextAction?: 'continue' | 'block' | 'request-supervisor';
}

export interface NavigationResult {
  nextStepIndex: number | null;
  shouldMarkRebut: boolean;
  message?: string;
  action?: 'continue' | 'end' | 'reject';
}

// Integration Service Interfaces (for future implementation)
export interface IntegrationService {
  name: string;
  initialize(): Promise<boolean>;
  executeHook(hookName: string, data: any): Promise<any>;
  isEnabled(): boolean;
}

export interface QRScanResult {
  objectId: string;
  objectType: string;
  status: string;
  metadata: any;
  validationStatus: 'valid' | 'invalid' | 'unknown';
}

export interface ActionBarHooks {
  photo?: (data: any) => Promise<any>;
  note?: (data: any) => Promise<any>;
  notification?: (data: any) => Promise<any>;
  documentation?: (data: any) => Promise<any>;
}

// Engine Events (for future event-driven architecture)
export interface ProcessEvent {
  eventType: 'step-enter' | 'step-validate' | 'step-complete' | 'process-complete' | 'process-reject';
  stepId: string;
  processType: string;
  data: any;
  timestamp: Date;
  integrationTargets?: string[];
}