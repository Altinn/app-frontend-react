import React from 'react';
import { useEngine, useComponentMap } from '../FormEngineProvider';

interface FormRendererProps {
  pageId?: string;
}

export function FormRenderer({ pageId }: FormRendererProps) {
  const engine = useEngine();
  const componentMap = useComponentMap();
  
  const components = React.useMemo(() => {
    if (pageId) {
      return engine.layout.getVisibleComponents(pageId);
    }
    return engine.layout.getCurrentPageComponents();
  }, [engine, pageId]);

  return (
    <div className="form-renderer">
      {components.map((component) => {
        const ComponentToRender = componentMap[component.type];
        
        if (!ComponentToRender) {
          console.warn(`Component type "${component.type}" not found in component map`);
          return (
            <div key={component.id} style={{ padding: '8px', border: '1px dashed red' }}>
              Unknown component: {component.type}
            </div>
          );
        }

        return (
          <ComponentToRender
            key={component.id}
            config={component}
            {...component}
          />
        );
      })}
    </div>
  );
}