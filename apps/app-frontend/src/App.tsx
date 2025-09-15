import React, { useEffect, useState } from 'react';

import { FormPage } from 'apps/app-frontend/src/pages/FormPage';
import { FormEngine } from 'libs/FormEngine';
import { simpleTestData } from 'libs/FormEngine/test/dummyData';

export function App() {
  const [engine] = useState(() => new FormEngine());
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      console.log('🚀 Initializing FormEngine in App...');
      engine.initialize(simpleTestData);
      setIsInitialized(true);
      console.log('✅ FormEngine initialized successfully');
    } catch (err) {
      console.error('❌ FormEngine initialization failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [engine]);

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>FormEngine Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Loading FormEngine...</h1>
        <p>Initializing form engine with test data...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>FormEngine Test App</h1>
      <FormPage engine={engine} />
    </div>
  );
}
