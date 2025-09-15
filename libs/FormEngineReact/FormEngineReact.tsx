import React from 'react';
import { FormEngine } from 'libs/FormEngine';
import { FormEngineProvider, ComponentMap } from './FormEngineProvider';
import { PageRenderer } from './components';

interface FormEngineReactProps {
  engine: FormEngine;
  componentMap: ComponentMap;
  pageId?: string;
  children?: React.ReactNode;
}

export function FormEngineReact({ 
  engine, 
  componentMap, 
  pageId,
  children 
}: FormEngineReactProps) {
  return (
    <FormEngineProvider engine={engine} componentMap={componentMap}>
      <div className="form-engine-react">
        {children || <PageRenderer pageId={pageId} />}
      </div>
    </FormEngineProvider>
  );
}
