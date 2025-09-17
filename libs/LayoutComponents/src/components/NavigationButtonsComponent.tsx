import React from 'react';
import type { FormEngineComponentContext } from 'libs/FormEngineReact/components';

export interface NavigationButtonsProps {
  formEngine: FormEngineComponentContext;
}

/**
 * NavigationButtons component for FormEngine
 * Displays navigation buttons (Previous, Next, Back to Summary)
 */
export const NavigationButtonsComponent: React.FC<NavigationButtonsProps> = ({ formEngine }) => {
  const { config, id, isVisible } = formEngine;
  
  if (!isVisible) {
    return null;
  }
  
  // TODO: Implement proper NavigationButtons functionality
  // This is a placeholder that will show the component is being rendered
  return (
    <div 
      className="navigation-buttons" 
      data-component-id={id}
      data-testid="NavigationButtons"
      style={{
        padding: '1rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        margin: '1rem 0',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap'
      }}
    >
      <div style={{ width: '100%' }}>
        <h4>Navigation Buttons - {id}</h4>
        <p>TODO: Implement NavigationButtons with FormEngine integration</p>
      </div>
      
      {/* Mock buttons to show the intended functionality */}
      <button 
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'not-allowed',
          opacity: 0.6
        }}
        disabled
      >
        Previous
      </button>
      
      <button 
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'not-allowed',
          opacity: 0.6
        }}
        disabled
      >
        Next
      </button>
      
      <button 
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'not-allowed',
          opacity: 0.6
        }}
        disabled
      >
        Back to Summary
      </button>
    </div>
  );
};