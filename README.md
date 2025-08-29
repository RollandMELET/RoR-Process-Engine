# RoR Process Engine V1.1

## 🚀 Generic JSON-Driven Industrial Process Engine

**RoR Process Engine** is a generic, configurable engine for industrial workflow management. It transforms JSON process definitions into fully functional user interfaces with business logic, validation, and integration hooks.

### 🎯 **Core Philosophy**
**Zero hardcoded business logic** - Everything is configurable through JSON:
- Process workflows
- User interfaces  
- Validation rules
- Navigation logic
- Integration hooks (360SmartConnect, URRATS, n8n)

## 🏗️ **Architecture Overview**

```
RoR-Process-Engine/
├── src/
│   ├── engine/          # Core Engine
│   │   ├── ProcessEngine.ts      # Main JSON interpreter & state management
│   │   ├── StepRenderer.tsx      # Dynamic UI generation
│   │   ├── ValidationEngine.ts   # JSON-driven validation  
│   │   └── NavigationEngine.ts   # Conditional navigation logic
│   ├── services/        # Integration Services (prepared)
│   │   ├── Integration360SC.ts   # 360SmartConnect API integration
│   │   ├── URRATSService.ts     # URRATS webhook integration
│   │   ├── N8NService.ts        # n8n workflow integration
│   │   └── ServiceRegistry.ts   # Service management
│   ├── components/      # Ultra-Generic Components
│   │   ├── DynamicStep.tsx      # Universal step component
│   │   ├── DynamicQuestionBlock.tsx
│   │   ├── DynamicCaptureForm.tsx
│   │   ├── DynamicValidationPanel.tsx
│   │   └── DynamicActionButton.tsx
│   ├── data/           # Process Definitions
│   │   ├── ProcessDalle-Generic.json
│   │   ├── ProcessToit-Generic.json
│   │   ├── ProcessEnveloppe-Generic.json
│   │   └── ProcessBLBeton-Generic.json
│   └── schemas/        # JSON Validation
│       └── ProcessSchema.json   # Complete JSON schema
└── examples/          # Usage Examples
```

## 🔧 **Key Features**

### ✅ **JSON-Driven Everything**
- **Process Definition**: Complete workflows in JSON
- **UI Generation**: Dynamic interface from JSON structure  
- **Business Logic**: Validation and navigation rules in JSON
- **Integration Points**: Hook definitions for external systems

### ✅ **Pattern Implementation**
- **REBUT Pattern**: Unified rejection handling across all PointArret
- **Questions Randomization**: Intelligent question ordering and validation
- **Conditional Navigation**: Smart routing based on user responses
- **Field Dependencies**: Dynamic form behavior

### ✅ **Integration Ready**
- **360SmartConnect**: API integration hooks prepared
- **URRATS**: Webhook notification system ready
- **n8n**: Workflow automation integration points
- **Modular Services**: Easy to add new integrations

## 🚀 **Quick Start**

```bash
# Clone and setup
git clone https://github.com/RollandMELET/RoR-Process-Engine.git
cd RoR-Process-Engine
git checkout v1.1
npm install

# Start development
npm start
# Opens on http://localhost:8081

# Run tests
npm test
```

## 📋 **JSON Process Definition Format**

### **Basic Structure**
```json
{
  "metadata": {
    "processType": "MouleDalle",
    "version": "V1.1-Generic",
    "ref": "Reference documentation",
    "integrations": {
      "360sc": { "enabled": false },
      "urrats": { "enabled": false }
    }
  },
  "processSteps": [
    {
      "stepId": "Etape 1",
      "stepName": "PC1 : VERIFICATION",
      "stepType": "PointControle",
      "questions": [
        {
          "ok": "System is clean",
          "ko": "System needs cleaning?"
        }
      ],
      "navigation": {
        "defaultNext": "Etape 2"
      }
    }
  ]
}
```

### **Step Types**

#### **PointControle** - Simple Checklist
- Questions with OK/KO responses
- Randomized order and versions
- All questions must be answered correctly

#### **PointControleSpecial** - Questions + Data Capture  
- Questions (like PointControle)
- Additional data capture fields
- ID scanning/manual entry support

#### **PointArret** - Critical Validation
- Supervisor-level validation
- REBUT pattern implementation  
- Conditional field requirements
- Integration hooks for status updates

#### **PointSynchronisation** - Cross-Process Data
- BL Béton assignments
- External system synchronization
- Data validation and transfer

## 🔄 **Engine Capabilities**

### **Dynamic UI Generation**
The engine reads JSON and generates appropriate UI:
- Question blocks with randomization
- Capture forms with validation
- Action buttons with conditional enabling
- Navigation with business logic

### **Smart Validation**
Multi-level validation system:
- Input validation (required fields, formats)
- Business rule validation (conditional requirements)  
- Pattern validation (REBUT compliance)
- Integration validation (external system checks)

### **Conditional Navigation** 
JSON-defined navigation rules:
```json
{
  "navigation": {
    "conditionalNext": [
      {
        "condition": "CONFORME ?=REBUT",
        "nextStepId": "END", 
        "action": "reject"
      },
      {
        "condition": "BESOIN DE FINITION ?=OUI",
        "nextStepId": "Etape 11",
        "action": "continue"
      }
    ]
  }
}
```

## 🔌 **Integration Architecture**

### **Service Layer (Prepared)**
Ready for integration with external systems:

#### **360SmartConnect Integration**
- QR Code scan → Object status lookup
- Step completion → Status updates  
- Photo capture → Document upload
- Real-time synchronization

#### **URRATS Integration**
- Quality alerts and notifications
- Rejection reporting
- Compliance tracking

#### **n8n Integration** 
- Workflow automation triggers
- Cross-system data flow
- Event-driven processes

### **Hook System**
Each step can define hooks for external integrations:
```json
{
  "hooks": {
    "onEnter": "360sc:getObjectStatus",
    "onValidate": "360sc:validateWithERP", 
    "onComplete": "urrats:notifyCompletion",
    "onReject": "n8n:triggerRejectionWorkflow"
  }
}
```

## 🧪 **Testing Strategy**

### **Pattern Compliance Tests**
- Verify REBUT pattern across all PointArret steps
- Validate Questions Randomization implementation
- Test conditional navigation logic

### **Engine Functionality Tests**  
- JSON parsing and validation
- Dynamic UI generation
- State management accuracy
- Integration hook preparation

### **Process Migration Tests**
- Parity with original prototype behavior  
- Performance benchmarking
- Cross-process consistency

## 🎯 **Migration from Prototype**

### **Elimination of Hardcoded Logic**
The prototype had **20+ hardcoded conditions** like:
```typescript
// OLD: Hardcoded logic
if (currentStep.Etat === 'Etape 8' && currentProcess.TypeObjet === 'MouleDalle') {
  // Specific UI and validation logic
}
```

```json
// NEW: JSON-driven logic  
{
  "stepId": "Etape 8",
  "stepType": "PointArret",
  "validation": { "requiresSupervisor": true },
  "navigation": { "conditionalNext": [...] }
}
```

### **Benefits of Generic Engine**
- **New Process** = New JSON file (no code changes)
- **Process Modification** = JSON edit (no deployment)
- **New Validation** = JSON rules (no programming)  
- **New Integration** = Hook configuration (no architecture change)

## 🔮 **Roadmap**

### **V1.1 (Current)**
- ✅ Generic engine architecture
- ✅ JSON-driven process execution
- ✅ Pattern migration from prototype
- ✅ Integration hooks preparation

### **V1.2 (Future)**
- 🔄 360SmartConnect API integration
- 🔄 URRATS webhook implementation  
- 🔄 Real QR scanning with object lookup
- 🔄 User authentication and permissions

### **V2.0 (Vision)**
- 🔮 Multi-tenant process engine
- 🔮 Visual process designer
- 🔮 Real-time analytics dashboard
- 🔮 Mobile/web/desktop deployment

---

*RoR Process Engine V1.1 - Transforming industrial workflow management through generic, JSON-driven architecture*