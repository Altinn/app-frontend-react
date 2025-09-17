import React from 'react';
import type { FormEngineComponentContext } from 'libs/FormEngineReact/components';

export interface SummaryV1Props {
  formEngine: FormEngineComponentContext;
}

/**
 * Summary (v1) component for FormEngine
 * Displays a summary of form data
 */
export const SummaryV1Component: React.FC<SummaryV1Props> = ({ formEngine }) => {
  const { config, id, isVisible } = formEngine;
  
  if (!isVisible) {
    return null;
  }
  
  // TODO: Implement proper Summary functionality
  // This is a placeholder that will show the component is being rendered
  return (
    <div 
      className="summary-component" 
      data-component-id={id}
      data-testid="Summary"
      style={{
        padding: '1rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        margin: '1rem 0',
        backgroundColor: '#f8f9fa'
      }}
    >
      <h4>Summary Component - {id}</h4>
      <p>TODO: Implement Summary with FormEngine integration</p>
      <div style={{ 
        padding: '0.5rem', 
        backgroundColor: '#e9ecef',
        borderRadius: '4px',
        fontSize: '0.9rem',
        fontFamily: 'monospace'
      }}>
        <strong>Component config:</strong>
        <br />
        {JSON.stringify(config, null, 2)}
      </div>
    </div>
  );
};