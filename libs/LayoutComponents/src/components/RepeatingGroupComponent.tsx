import React from 'react';

import { withFormEngine } from 'libs/FormEngineReact/components/FormEngineComponent';
import { useRepeatingGroup } from 'libs/FormEngineReact/hooks/useRepeatingGroup';
import type { FormEngineComponentContext } from 'libs/FormEngineReact/components/FormEngineComponent';

interface RepeatingGroupComponentProps {
  formEngine: FormEngineComponentContext;
  className?: string;
}

function RepeatingGroupComponentBase({ formEngine, className = '' }: RepeatingGroupComponentProps) {
  const { config } = formEngine;

  // Get the data model binding for the repeating group
  const dataModelBinding = config.dataModelBindings?.group || config.dataModelBindings?.simpleBinding || '';

  const { items, count, addRow, removeRow, moveRow } = useRepeatingGroup(dataModelBinding);

  const containerStyles = {
    marginBottom: '24px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '16px',
  };

  const headerStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    paddingBottom: '8px',
    borderBottom: '1px solid #e0e0e0',
  };

  const titleStyles = {
    fontSize: '16px',
    fontWeight: 'bold' as const,
    margin: 0,
  };

  const addButtonStyles = {
    padding: '8px 16px',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  };

  const itemStyles = {
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    border: '1px solid #e9ecef',
    position: 'relative' as const,
  };

  const itemHeaderStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  };

  const removeButtonStyles = {
    padding: '4px 8px',
    backgroundColor: '#d32f2f',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  };

  const moveButtonStyles = {
    padding: '4px 8px',
    backgroundColor: '#757575',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    marginRight: '4px',
  };

  return (
    <div
      style={containerStyles}
      className={`repeating-group-component ${className}`}
    >
      {/* Header */}
      <div style={headerStyles}>
        <h3 style={titleStyles}>
          {config.textResourceBindings?.title || 'Repeating Group'} ({count})
        </h3>
        <button
          style={addButtonStyles}
          onClick={addRow}
          type='button'
        >
          Add Item
        </button>
      </div>

      {/* Description */}
      {config.textResourceBindings?.description && (
        <p style={{ marginBottom: '16px', fontSize: '14px', color: '#666' }}>
          {config.textResourceBindings.description}
        </p>
      )}

      {/* Items */}
      {items.map((_, index) => (
        <div
          key={index}
          style={itemStyles}
        >
          <div style={itemHeaderStyles}>
            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Item {index + 1}</span>
            <div>
              {index > 0 && (
                <button
                  style={moveButtonStyles}
                  onClick={() => moveRow(index, index - 1)}
                  type='button'
                  title='Move up'
                >
                  ↑
                </button>
              )}
              {index < count - 1 && (
                <button
                  style={moveButtonStyles}
                  onClick={() => moveRow(index, index + 1)}
                  type='button'
                  title='Move down'
                >
                  ↓
                </button>
              )}
              <button
                style={removeButtonStyles}
                onClick={() => removeRow(index)}
                type='button'
              >
                Remove
              </button>
            </div>
          </div>

          {/* Render child components for this repeating group item */}
          {config.children && (
            <div style={{ marginTop: '8px' }}>
              {/* TODO: This should render child components using FormEngineReact */}
              <div style={{ fontSize: '12px', color: '#999', fontStyle: 'italic' }}>
                Child components would be rendered here for item {index}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Empty state */}
      {count === 0 && (
        <div style={{ textAlign: 'center', padding: '24px', color: '#666' }}>
          No items yet. Click "Add Item" to get started.
        </div>
      )}
    </div>
  );
}

export const RepeatingGroupComponent = withFormEngine(RepeatingGroupComponentBase);