import React from 'react';

import { FormEngineReact } from 'libs/FormEngineReact';
import { defaultComponentMap } from 'libs/LayoutComponents';
import type { FormEngine } from 'libs/FormEngine';

interface FormPageProps {
  engine: FormEngine;
}

export function FormPage({ engine }: FormPageProps) {
   const customComponentMap = { ...defaultComponentMap };

  return (
    <div>
      <h2>Form Renderer</h2>
      <FormEngineReact
        engine={engine}
        componentMap={defaultComponentMap}
      />
    </div>
  );
}
