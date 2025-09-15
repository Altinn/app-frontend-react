import React from 'react';
import { FormEngine } from 'libs/FormEngine';
import { FormEngineReact } from 'libs/FormEngineReact';
import { defaultComponentMap } from 'libs/LayoutComponents';

interface FormPageProps {
  engine: FormEngine;
}

export function FormPage({ engine }: FormPageProps) {
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