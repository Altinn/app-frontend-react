import React from 'react';

import { PageRenderer } from 'libs/FormEngineReact/components';
import { FormEngineProvider } from 'libs/FormEngineReact/FormEngineProvider';
import type { FormEngine } from 'libs/FormEngine';
import type { ComponentMap } from 'libs/FormEngineReact/FormEngineProvider';

interface FormEngineReactProps {
  engine: FormEngine;
  componentMap: ComponentMap;
  pageId?: string;
  children?: React.ReactNode;
}

export function FormEngineReact({ engine, componentMap, pageId, children }: FormEngineReactProps) {
  return (
    <FormEngineProvider
      engine={engine}
      componentMap={componentMap}
    >
      <div className='form-engine-react'>{children || <PageRenderer pageId={pageId} />}</div>
    </FormEngineProvider>
  );
}
