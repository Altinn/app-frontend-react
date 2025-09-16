import React from 'react';

import { FormPage } from 'apps/app-frontend/src/pages/FormPage';
import { FormEngine } from 'libs/FormEngine';
import { simpleTestData } from 'libs/FormEngine/test/dummyData';

export function App() {
  const engine = new FormEngine();
  engine.initialize(simpleTestData);

  return (
    <div style={{ padding: '20px' }}>
      <h1>FormEngine Test App</h1>
      <FormPage engine={engine} />
    </div>
  );
}
