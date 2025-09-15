# Implementation Plan: FormEngine Architecture

## Goal
Achieve first milestone: Render layouts and update data properly with dummy data in the new app architecture.

## Phase 1: Core FormEngine Setup (Days 1-3)

### Step 1: FormEngine Core Class
**File**: `libs/FormEngine/index.ts`

```typescript
import { dataService } from './modules/data/data.service';
import { layoutService } from './modules/layout/layout.service';
import { expressionService } from './modules/expression/expression.service';
import { validationService } from './modules/validation/validation.service';

export class FormEngine {
  public data = dataService;
  public layout = layoutService;
  public expression = expressionService;
  public validation = validationService;
  
  initialize(config: FormEngineConfig) {
    // Initialize stores with config
    this.data.setData(config.dataModel || {});
    this.layout.setLayouts(config.layouts);
  }
}
```

**Tasks**:
- [x] Data store and service (already implemented)
- [ ] Layout store and service
- [ ] Basic expression service
- [ ] Event emitter system

### Step 2: Layout Store and Service
**File**: `libs/FormEngine/modules/layout/layout.store.ts`

```typescript
import { createStore } from 'zustand/vanilla';

export interface LayoutStore {
  layouts: LayoutCollection;
  currentPage: string;
  resolvedLayouts: ResolvedLayoutCollection;
  setLayouts: (layouts: LayoutCollection) => void;
  setCurrentPage: (pageId: string) => void;
  getLayout: (pageId: string) => ResolvedLayout;
  getComponent: (componentId: string) => ResolvedComponent;
}
```

**File**: `libs/FormEngine/modules/layout/layout.service.ts`

```typescript
export class LayoutService {
  private store = layoutStore;
  
  setLayouts(layouts: LayoutCollection) {
    this.store.getState().setLayouts(layouts);
    this.resolveLayouts();
  }
  
  private resolveLayouts() {
    // Resolve expressions, build component tree
  }
  
  getVisibleComponents(pageId: string): ResolvedComponent[] {
    // Return filtered components based on visibility
  }
}
```

## Phase 2: React Integration Layer (Days 4-6)

### Step 3: FormEngineReact Provider
**File**: `libs/FormEngineReact/FormEngineProvider.tsx`

```typescript
import React, { createContext, useContext } from 'react';
import { FormEngine } from '@libs/FormEngine';

const FormEngineContext = createContext<{
  engine: FormEngine;
  componentMap: ComponentMap;
}>(null);

export function FormEngineProvider({ engine, componentMap, children }) {
  return (
    <FormEngineContext.Provider value={{ engine, componentMap }}>
      {children}
    </FormEngineContext.Provider>
  );
}

export const useFormEngine = () => useContext(FormEngineContext);
```

### Step 4: FormRenderer Component
**File**: `libs/FormEngineReact/FormRenderer.tsx`

```typescript
export function FormRenderer({ pageId }: { pageId: string }) {
  const { engine, componentMap } = useFormEngine();
  const components = engine.layout.getVisibleComponents(pageId);
  
  return (
    <div className="form-renderer">
      {components.map(component => (
        <ComponentRenderer 
          key={component.id}
          component={component}
          componentMap={componentMap}
        />
      ))}
    </div>
  );
}
```

### Step 5: Core Hooks
**File**: `libs/FormEngineReact/hooks/useFormData.ts`

```typescript
export function useFormData(path: string) {
  const { engine } = useFormEngine();
  const [value, setLocalValue] = useState(() => engine.data.getValue(path));
  
  useEffect(() => {
    const unsubscribe = engine.data.subscribeToPath(path, (newValue) => {
      setLocalValue(newValue);
    });
    return unsubscribe;
  }, [path]);
  
  const setValue = useCallback((newValue: any) => {
    engine.data.setValue(path, newValue);
  }, [path]);
  
  return [value, setValue] as const;
}
```

## Phase 3: Component Library (Days 7-8)

### Step 6: Migrate Core Components
**File**: `libs/LayoutComponents/components/Input/Input.tsx`

```typescript
import React from 'react';
import { useFormData } from '@libs/FormEngineReact';

export interface InputProps {
  id: string;
  dataModelBindings: {
    simpleBinding: string;
  };
  textResourceBindings?: {
    title?: string;
  };
  required?: boolean;
  readOnly?: boolean;
}

export function Input({ dataModelBindings, textResourceBindings, ...props }: InputProps) {
  const [value, setValue] = useFormData(dataModelBindings.simpleBinding);
  
  return (
    <div className="form-field">
      {textResourceBindings?.title && (
        <label>{textResourceBindings.title}</label>
      )}
      <input
        value={value || ''}
        onChange={(e) => setValue(e.target.value)}
        required={props.required}
        readOnly={props.readOnly}
      />
    </div>
  );
}
```

### Step 7: Component Map
**File**: `libs/LayoutComponents/index.ts`

```typescript
import { Input } from './components/Input/Input';
import { Select } from './components/Select/Select';
import { TextArea } from './components/TextArea/TextArea';

export const defaultComponentMap = {
  'Input': Input,
  'Select': Select,
  'TextArea': TextArea,
  // Add more as needed
};

export type ComponentMap = typeof defaultComponentMap;
```

## Phase 4: Application Setup (Days 9-10)

### Step 8: Create App Structure
**File**: `apps/app-frontend/src/main.tsx`

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**File**: `apps/app-frontend/src/App.tsx`

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FormEngine } from '@libs/FormEngine';
import { FormEngineProvider } from '@libs/FormEngineReact';
import { defaultComponentMap } from '@libs/LayoutComponents';
import { FormPage } from './pages/FormPage';

function App() {
  const [engine] = useState(() => new FormEngine());
  
  useEffect(() => {
    // Initialize with dummy data
    engine.initialize({
      layouts: dummyLayouts,
      dataModel: dummyData
    });
  }, []);
  
  return (
    <BrowserRouter>
      <FormEngineProvider engine={engine} componentMap={defaultComponentMap}>
        <Routes>
          <Route path="/" element={<FormPage />} />
        </Routes>
      </FormEngineProvider>
    </BrowserRouter>
  );
}
```

### Step 9: Create Dummy Data
**File**: `apps/app-frontend/src/data/dummyData.ts`

```typescript
export const dummyLayouts = {
  'page1': {
    $schema: 'https://altinncdn.no/schemas/json/layout/layout.schema.v1.json',
    data: {
      layout: [
        {
          id: 'name-input',
          type: 'Input',
          dataModelBindings: {
            simpleBinding: 'person.name'
          },
          textResourceBindings: {
            title: 'Full Name'
          },
          required: true
        },
        {
          id: 'email-input',
          type: 'Input',
          dataModelBindings: {
            simpleBinding: 'person.email'
          },
          textResourceBindings: {
            title: 'Email Address'
          }
        },
        {
          id: 'age-input',
          type: 'Input',
          dataModelBindings: {
            simpleBinding: 'person.age'
          },
          textResourceBindings: {
            title: 'Age'
          }
        }
      ]
    }
  }
};

export const dummyData = {
  person: {
    name: 'John Doe',
    email: 'john@example.com',
    age: 30
  }
};
```

### Step 10: Form Page Component
**File**: `apps/app-frontend/src/pages/FormPage.tsx`

```typescript
import { FormRenderer } from '@libs/FormEngineReact';
import { useFormEngine } from '@libs/FormEngineReact';

export function FormPage() {
  const { engine } = useFormEngine();
  
  const handleSubmit = () => {
    const data = engine.data.getData();
    console.log('Form Data:', data);
  };
  
  return (
    <div className="form-page">
      <h1>Test Form</h1>
      <FormRenderer pageId="page1" />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
```

## Implementation Order

### Week 1: Core Foundation
1. **Day 1-2**: Complete FormEngine core
   - Finish layout store/service
   - Basic expression service stub
   - Test initialization

2. **Day 3**: React Provider Setup
   - FormEngineProvider
   - Basic context setup
   - useFormEngine hook

### Week 2: Components & Integration
3. **Day 4-5**: Component Migration
   - Input component
   - Select component
   - Component map setup

4. **Day 6-7**: Form Renderer
   - FormRenderer component
   - ComponentRenderer
   - useFormData hook

5. **Day 8-9**: Application Setup
   - Create app-frontend structure
   - Set up routing
   - Add dummy data

6. **Day 10**: Testing & Refinement
   - End-to-end testing
   - Data flow verification
   - Bug fixes

## Success Criteria

✅ **Milestone 1 Complete When**:
- [ ] FormEngine initializes with layouts and data
- [ ] FormRenderer displays all components from layout
- [ ] Input components show initial data values
- [ ] Typing in inputs updates the data store
- [ ] Submit button logs current form data
- [ ] No React re-render performance issues
- [ ] Clean separation between libraries

## Testing Checklist

### Unit Tests
- [ ] FormEngine initialization
- [ ] Data service get/set operations
- [ ] Layout service component resolution
- [ ] React hooks behavior

### Integration Tests
- [ ] FormEngine + FormEngineReact integration
- [ ] Component rendering with data binding
- [ ] Data flow from UI to store

### Manual Testing
- [ ] Load form with dummy data
- [ ] Edit all form fields
- [ ] Verify data updates in console
- [ ] Check for console errors
- [ ] Verify component styling

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Components not rendering | Check component map registration |
| Data not updating | Verify subscription setup in hooks |
| Layout not found | Ensure layout key matches in dummy data |
| TypeScript errors | Update type definitions in types.ts |
| Build errors | Check import paths and exports |

## Next Steps After Milestone 1

1. **Expression Evaluation**: Implement visibility conditions
2. **Validation**: Add form validation logic
3. **Repeating Groups**: Support for dynamic arrays
4. **API Integration**: Replace dummy data with real API
5. **Process Flow**: Add multi-page navigation
6. **Styling**: Integrate design system

## Development Commands

```bash
# Install dependencies
yarn install

# Run development server
yarn dev

# Build libraries
yarn build:libs

# Run tests
yarn test

# Type checking
yarn typecheck
```

## File Creation Order

1. `libs/FormEngine/types.ts` - Core type definitions
2. `libs/FormEngine/modules/layout/layout.store.ts`
3. `libs/FormEngine/modules/layout/layout.service.ts`
4. `libs/FormEngine/index.ts` - Main FormEngine class
5. `libs/FormEngineReact/FormEngineProvider.tsx`
6. `libs/FormEngineReact/hooks/useFormData.ts`
7. `libs/FormEngineReact/FormRenderer.tsx`
8. `libs/LayoutComponents/components/Input/Input.tsx`
9. `libs/LayoutComponents/index.ts`
10. `apps/app-frontend/src/App.tsx`
11. `apps/app-frontend/src/data/dummyData.ts`
12. `apps/app-frontend/src/pages/FormPage.tsx`

This order ensures dependencies are created before they're needed.