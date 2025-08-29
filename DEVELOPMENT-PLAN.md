# RoR Process Engine V1.1 - Development Plan & Context

## 🎯 **Project Context**

### **Origin**
This project is the **V1.1 evolution** of a working prototype located at:
```
/Users/rollandmelet/Library/CloudStorage/GoogleDrive-rm@360sc.io/Mon Drive/OBSIDIAN/CHATTERS/002 - Projets/360SmartConnect/PROJETS CLIENT/DUHALDE/000 - Test Dev UI/duhalde-ui/
```

### **Objective** 
Transform the **hardcoded prototype** into a **generic, JSON-driven process engine** that can handle any industrial workflow through configuration, not code changes.

### **Business Context**
- **Client**: Duhalde Industries (precast concrete manufacturing)
- **Use Case**: Tablet application (1280x800) for operators wearing gloves
- **Processes**: 3 manufacturing workflows (Envelope/Slab/Roof) + BL Béton workflow
- **Environment**: Industrial workshop with touch screens

## 🔍 **Analysis of Prototype Issues**

### **Hardcoded Logic Identified (To Eliminate)**
The prototype contains **20+ hardcoded conditions** in `ProcessScreen.tsx`:
```typescript
// HARDCODED - TO ELIMINATE
if (currentStep.Etat === 'Etape 8' && currentProcess.TypeObjet === 'MouleDalle') {
  return <PointArretEtendu /* specific props */ />;
}
if (currentStep.Etat === 'Etape 10' && currentProcess.TypeObjet === 'MouleEnveloppe') {
  return <PointArret /* different specific props */ />;
}
// ... 18+ more similar conditions
```

### **Validation Logic Issues (To Generalize)**
The prototype has **9+ process-specific validations** in `processStore.ts`:
```typescript
// HARDCODED - TO ELIMINATE  
else if (currentStep.Etat === 'Etape 8' && currentProcess.TypeObjet === 'MouleDalle') {
  const conformeKey = 'CONFORME ?';
  const segregationKey = 'SÉGRÉGATION ET/OU BULLAGE MINEUR ?';
  // Specific validation logic...
}
// ... 8+ more similar validations
```

### **Successful Patterns (To Preserve)**
The prototype successfully implements:
- ✅ **REBUT Pattern**: Unified rejection handling (documented in `REBUT-PATTERN-DOCUMENTATION.md`)
- ✅ **Questions Randomization**: Smart question ordering (documented in `QUESTIONS-RANDOMIZATION-PATTERN.md`)  
- ✅ **Industrial UI/UX**: Optimized for glove usage, large touch targets
- ✅ **Atomic Design**: Well-structured component hierarchy

## 🏗️ **V1.1 Architecture Goals**

### **Core Principle: JSON-Driven Everything**
- **Process Definition**: Complete workflows in JSON
- **UI Generation**: Dynamic interface from JSON structure
- **Business Logic**: Validation and navigation rules in JSON
- **Zero Hardcoding**: New processes = new JSON files (no code changes)

### **Engine Components Created**

#### **Core Engine (`src/engine/`)**
1. **ProcessEngine.ts** - Main JSON interpreter with state management
   - Loads any JSON process definition
   - Manages step navigation with business logic
   - Handles question randomization system
   - Executes validation rules

2. **StepRenderer.tsx** - Dynamic UI generation  
   - Replaces all hardcoded step templates
   - Renders UI based on step type and configuration
   - Handles all 4 step types: PointControle/PointControleSpecial/PointArret/PointSynchronisation

#### **Type System (`src/types/`)**
- **ProcessEngine.types.ts** - Complete TypeScript interfaces
- Covers all engine functionality and integration points

#### **JSON Schema (`src/schemas/`)**
- **ProcessSchema.json** - Validation schema for process definitions
- Ensures JSON files are well-formed and complete

## 🔄 **Integration Preparation (Future Implementation)**

### **360SmartConnect Integration Hooks**
The engine is prepared for:
- **QR Code Scan** → API call to get object status and metadata
- **Step Completion** → Update object status in 360SC
- **ActionBar Actions**:
  - **Photo** → Upload to 360SC with object/step context
  - **Note** → Save annotation to 360SC object
  - **Notification** → Send alert via 360SC system  
  - **Documentation** → Open 360SC docs for current object/step

### **URRATS Integration Hooks**
- **Quality Alerts** → Webhook notifications on quality issues
- **Rejection Reporting** → Automatic URRATS notification on REBUT
- **Compliance Tracking** → Step completion reporting

### **n8n Workflow Integration**
- **Process Events** → Trigger n8n workflows on step completion
- **Cross-System Data Flow** → Automated data synchronization
- **Error Handling** → Automated escalation workflows

## 📋 **Immediate Development Tasks**

### **Phase A: Complete Core Components (HIGH PRIORITY)**

#### **A1. Dynamic Component Implementation**
Create the missing generic components referenced in StepRenderer:

1. **`src/components/DynamicQuestionBlock.tsx`**
   - Replace hardcoded QuestionBlock with JSON-driven version
   - Implement question randomization display
   - Handle OK/KO response collection

2. **`src/components/DynamicCaptureForm.tsx`**
   - Replace hardcoded CaptureForm with field factory
   - Support all field types: text, binary, scan, auto, timestamp
   - Implement conditional field display

3. **`src/components/DynamicValidationPanel.tsx`**
   - Replace hardcoded ValidationPanel for PointArret steps
   - Support REBUT pattern implementation
   - Handle conditional field requirements

4. **`src/components/DynamicActionButton.tsx`**
   - Generic button with variant support (primary/disabled/secondary)
   - Integration hook preparation

5. **`src/components/DynamicIntroQuestion.tsx`**
   - Generic intro question component
   - Yes/No response handling

6. **`src/components/StepHeader.tsx`**
   - Generic step header with process info
   - Progress indicator

7. **`src/components/ActionBar.tsx`**  
   - Generic action bar with configurable actions
   - Hook system for external integrations

#### **A2. Engine Integration**
1. **Update App.tsx** - Use ProcessEngine instead of hardcoded navigation
2. **Create EngineProvider** - React context for engine state
3. **Implement useEngine hook** - React hook for engine interaction

### **Phase B: Process Migration (MEDIUM PRIORITY)**

#### **B1. Convert Prototype Processes to Generic JSON**
Migrate from prototype `src/data/` to engine format:

1. **ProcessDalle-Generic.json** (Started)
   - Convert all 11 steps to generic format
   - Add navigation rules, validation config, integration hooks
   - Preserve exact behavior from prototype

2. **ProcessToit-Generic.json**
   - Convert all 15 steps with corrected navigation logic
   - Implement Step 7 logic (Bon pour étapes suivantes)
   - Add REBUT pattern for Steps 8,10,12,15

3. **ProcessEnveloppe-Generic.json**
   - Convert V2 format to generic engine format
   - Preserve simplified Step 7 logic
   - Maintain all REBUT pattern steps

4. **ProcessBLBeton-Generic.json**
   - Convert 5-step BL workflow to generic format
   - Maintain BL-specific business logic

#### **B2. Validation Rules Migration**
Extract all hardcoded validation from `processStore.ts` and convert to JSON rules:
- Conditional field requirements
- Step-specific validation logic  
- REBUT pattern validation
- Question response validation

### **Phase C: Testing & Validation (HIGH PRIORITY)**

#### **C1. Parity Testing**
Create comprehensive tests to ensure V1.1 behaves identically to prototype:

1. **Visual Parity Tests**
   - UI looks identical to prototype
   - Same components, same styling, same behavior

2. **Functional Parity Tests**  
   - Navigation logic identical
   - Validation logic identical
   - REBUT pattern behavior identical
   - Questions randomization identical

3. **Performance Parity Tests**
   - Engine performance comparable to prototype
   - Memory usage acceptable
   - Response times equivalent

#### **C2. Engine-Specific Tests**
1. **JSON Parsing Tests** - Validate engine correctly interprets JSON
2. **Dynamic Rendering Tests** - Verify UI generation works correctly  
3. **State Management Tests** - Ensure state consistency
4. **Integration Hook Tests** - Verify hooks execute correctly (mock)

## 🔧 **Implementation Details**

### **Key Design Decisions**

#### **1. Component Factory Pattern**
Instead of hardcoded components, use factories:
```typescript
// OLD PROTOTYPE
if (stepType === 'PointControle') return <PointControle />;
if (stepType === 'PointArret') return <PointArret />;

// NEW ENGINE
<StepRenderer step={step} /> // Dynamically renders based on step.stepType
```

#### **2. Rule Engine for Validation**
Instead of hardcoded validation, use rule interpretation:
```typescript
// OLD PROTOTYPE
if (currentStep.Etat === 'Etape 8' && processType === 'MouleDalle') {
  // Hardcoded validation logic
}

// NEW ENGINE  
this.validateStep(step, captureValues) // Uses step.validation rules from JSON
```

#### **3. Navigation State Machine**
Instead of hardcoded navigation, use JSON-defined rules:
```json
{
  "navigation": {
    "conditionalNext": [
      {
        "condition": "CONFORME ?=REBUT",
        "nextStepId": "END",
        "action": "reject"
      }
    ]
  }
}
```

### **Critical Implementation Notes**

#### **Preserve Prototype Behavior Exactly**
- **REBUT Pattern**: Must work identically across all PointArret steps
- **Questions Randomization**: Same ok-only/ok-ko-random modes
- **Conditional Navigation**: Step 7→8/9, Step 10→11/13 logic preserved  
- **Field Dependencies**: Dynamic field showing/hiding maintained

#### **Industrial Requirements**  
- **Touch Targets**: Minimum 48dp for glove usage
- **Performance**: Must be as responsive as prototype
- **Reliability**: Zero regressions in functionality
- **Visual Consistency**: Identical look and feel

#### **Integration Preparation**
- **Service Interfaces**: Define contracts for 360SC/URRATS/n8n
- **Hook Points**: Identify where external APIs will be called
- **Data Flow**: Plan how external data flows through engine
- **Error Handling**: Prepare for API failures and retries

## 📚 **Reference Materials**

### **From Prototype Project**
Essential files to reference during migration:

#### **Pattern Documentation** 
- `REBUT-PATTERN-DOCUMENTATION.md` - Complete REBUT implementation guide
- `QUESTIONS-RANDOMIZATION-PATTERN.md` - Question system specification
- `CLAUDE.md` - Development guidelines and context

#### **Current Working Process Definitions**
- `src/data/ProcessMouleEnveloppe_V2.json` - V2 with unified patterns
- `src/data/ProcessDalle.json` - Working Dalle process
- `src/data/ProcessToit.json` - Working Toit process  
- `src/data/ProcessBLBeton-v2.json` - Working BL workflow

#### **Key Implementation Files**
- `src/store/processStore.ts` - State management patterns to preserve
- `src/screens/ProcessScreen.tsx` - All hardcoded logic to eliminate
- `src/utils/processLogic.ts` - Business logic to convert to JSON rules
- `src/components/templates/` - All templates to replace with StepRenderer

#### **Successful Tests**
- `tests/` directory - All Playwright tests validating current behavior
- These serve as acceptance criteria for V1.1 parity

## 🚀 **Getting Started for New Claude Instance**

### **Prerequisites**
1. **Understanding**: Read `REBUT-PATTERN-DOCUMENTATION.md` and `QUESTIONS-RANDOMIZATION-PATTERN.md` from prototype
2. **Context**: Review this document completely
3. **Reference**: Keep prototype project accessible for behavior verification

### **Development Workflow**
1. **Implement missing components** (Phase A tasks)
2. **Test each component** against prototype behavior  
3. **Migrate one process at a time** (Phase B tasks)
4. **Validate parity** after each migration (Phase C tasks)

### **Success Criteria**
- ✅ **Identical Behavior**: V1.1 must behave exactly like prototype
- ✅ **Zero Hardcoding**: All process logic configurable via JSON
- ✅ **Performance**: Equivalent or better than prototype
- ✅ **Extensibility**: Ready for 360SmartConnect integration

### **Commands**
```bash
# Development  
cd /Users/rollandmelet/Développement/Projets/RoR-Process-Engine
npm start # Port 8082 (to avoid conflict with prototype on 8081)

# Testing
npm test

# Reference prototype
cd /Users/rollandmelet/Library/CloudStorage/GoogleDrive-rm@360sc.io/Mon\ Drive/OBSIDIAN/CHATTERS/002\ -\ Projets/360SmartConnect/PROJETS\ CLIENT/DUHALDE/000\ -\ Test\ Dev\ UI/duhalde-ui
npm start # Port 8081 (for comparison)
```

## ⚠️ **Critical Constraints**

### **Do NOT Modify Prototype**
- **Absolute rule**: Never modify files in `duhalde-ui/` directory
- **Purpose**: Prototype must remain functional as reference
- **Testing**: Use prototype for behavior validation only

### **Preserve Industrial Requirements**
- **Touch targets**: 48dp minimum for glove usage
- **Text size**: 18px minimum for workshop readability  
- **Colors**: Industrial orange (#FF6B00) for safety
- **Layout**: Landscape tablet optimization (1280x800)

### **Pattern Compliance**
- **REBUT Pattern**: Must work identically across all PointArret steps
- **Questions Randomization**: Preserve both ok-only and ok-ko-random modes
- **Conditional Navigation**: Maintain Step 7 and Step 10 logic exactly

## 📊 **Current Status**

### ✅ **Completed**
- GitHub repository created: `RoR-Process-Engine` branch `v1.1`
- Core architecture implemented: ProcessEngine.ts, StepRenderer.tsx
- JSON schema defined: ProcessSchema.json with complete validation
- TypeScript interfaces: Comprehensive type system
- Documentation: README.md with technical details
- Example migration: ProcessDalle-Generic.json (partial)

### 🔧 **Immediate Tasks** 
1. **Complete Dynamic Components** (7 components needed)
2. **Finish ProcessDalle Migration** (3 steps completed, 8 remaining)
3. **Migrate ProcessToit and ProcessEnveloppe** 
4. **Implement Engine Provider and Hooks**
5. **Create Parity Tests**

### 🎯 **Priority Order**
1. **HIGH**: Complete core components (engine won't work without them)
2. **HIGH**: Parity testing framework (validation essential)  
3. **MEDIUM**: Process migration (behavior preservation)
4. **LOW**: Integration hook refinement (future functionality)

## 🔮 **Future Integration Vision**

### **360SmartConnect Integration (V1.2)**
When implemented, the engine will:
- **QR Scan** → `360sc:getObjectStatus(uuid)` → Display current object status
- **Step Complete** → `360sc:updateObjectStatus(uuid, newStatus)` → Update object in platform
- **Photo Action** → `360sc:uploadImage(uuid, stepId, imageData)` → Store in object history
- **Note Action** → `360sc:saveNote(uuid, stepId, noteText)` → Add to object annotations

### **URRATS Integration (V1.2)**
- **Quality Alert** → `urrats:sendQualityAlert(objectId, issueType)` → Notify quality team
- **Rejection** → `urrats:reportRejection(objectId, reason)` → Quality tracking
- **Compliance** → `urrats:reportCompliance(objectId, stepId)` → Audit trail

### **Webhook Integration (V1.2)**
- **Process Events** → Configurable webhooks to third-party systems
- **ERP Integration** → Production status updates
- **MES Integration** → Manufacturing execution sync

## 💡 **Development Tips**

### **Working with the Engine**
- **Start Small**: Implement one component at a time
- **Test Continuously**: Compare with prototype after each component
- **Follow Patterns**: Use existing prototype patterns as templates
- **JSON First**: Define behavior in JSON before implementing code

### **Understanding the Prototype**
Key files to study for behavior reference:
- `ProcessScreen.tsx` (lines 450-750) - All hardcoded step rendering
- `processStore.ts` (lines 380-500) - All validation logic
- `processLogic.ts` - Navigation and field dependency logic

### **Component Migration Strategy** 
For each prototype component:
1. **Identify** what makes it specific vs generic
2. **Extract** the configurable parts to JSON
3. **Implement** generic version using JSON configuration
4. **Test** against prototype behavior

## 🎯 **Success Definition**

The V1.1 engine is successful when:
- ✅ **Identical UI**: Looks exactly like prototype
- ✅ **Identical Behavior**: Functions exactly like prototype  
- ✅ **JSON Configurable**: New process = JSON file only
- ✅ **Integration Ready**: 360SC/URRATS/n8n hooks functional
- ✅ **Performance**: Equal or better than prototype

---

## 🚀 **Quick Start for New Claude Instance**

```bash
# Setup
cd /Users/rollandmelet/Développement/Projets/RoR-Process-Engine
git status  # Should be on v1.1 branch
npm install
npm start   # Start on port 8082

# Reference prototype (separate terminal)
cd /Users/rollandmelet/Library/CloudStorage/GoogleDrive-rm@360sc.io/Mon\ Drive/OBSIDIAN/CHATTERS/002\ -\ Projets/360SmartConnect/PROJETS\ CLIENT/DUHALDE/000\ -\ Test\ Dev\ UI/duhalde-ui
npm start   # Reference on port 8081
```

**Start with implementing the missing components in `src/components/` - the engine won't work without them!**

---

*This development plan provides complete context for autonomous work on the RoR Process Engine V1.1. The goal is to transform the working prototype into a truly generic, JSON-configurable process engine while preserving all functionality and preparing for 360SmartConnect ecosystem integration.*