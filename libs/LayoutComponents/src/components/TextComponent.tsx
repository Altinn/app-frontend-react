import React from 'react';
import { withFormEngine } from 'libs/FormEngineReact/components/FormEngineComponent';
import type { FormEngineComponentContext } from 'libs/FormEngineReact/components/FormEngineComponent';

interface TextComponentProps {
  formEngine: FormEngineComponentContext;
  variant?: 'body' | 'subtitle' | 'caption';
  align?: 'left' | 'center' | 'right';
  className?: string;
}

function TextComponentBase({ 
  formEngine,
  variant = 'body',
  align = 'left',
  className = ''
}: TextComponentProps) {
  const { config } = formEngine;

  const getVariantStyles = () => {
    switch (variant) {
      case 'subtitle':
        return {
          fontSize: '16px',
          fontWeight: 'bold' as const,
          marginBottom: '8px',
        };
      case 'caption':
        return {
          fontSize: '12px',
          color: '#666',
          marginBottom: '4px',
        };
      case 'body':
      default:
        return {
          fontSize: '14px',
          marginBottom: '16px',
        };
    }
  };

  const containerStyles = {
    ...getVariantStyles(),
    textAlign: align as any,
    margin: '0 0 16px 0',
  };

  return (
    <div style={containerStyles} className={`text-component ${className}`}>
      {config.textResourceBindings?.title && (
        <span>{config.textResourceBindings.title}</span>
      )}
      {config.textResourceBindings?.description && (
        <div style={{ marginTop: '4px', fontSize: '12px', color: '#666' }}>
          {config.textResourceBindings.description}
        </div>
      )}
    </div>
  );
}

// Export wrapped component  
export const TextComponent = withFormEngine(TextComponentBase);