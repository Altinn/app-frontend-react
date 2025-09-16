import React from 'react';
import { withFormEngine } from 'libs/FormEngineReact/components/FormEngineComponent';
import type { FormEngineComponentContext } from 'libs/FormEngineReact/components/FormEngineComponent';

interface HeaderComponentProps {
  formEngine: FormEngineComponentContext;
  size?: 'S' | 'M' | 'L' | 'XL';
  className?: string;
}

function HeaderComponentBase({ 
  formEngine,
  size = 'M',
  className = ''
}: HeaderComponentProps) {
  const { config } = formEngine;

  const getSizeStyles = () => {
    switch (size) {
      case 'XL':
        return {
          fontSize: '32px',
          fontWeight: 'bold' as const,
          marginBottom: '24px',
        };
      case 'L':
        return {
          fontSize: '24px',
          fontWeight: 'bold' as const,
          marginBottom: '20px',
        };
      case 'M':
        return {
          fontSize: '20px',
          fontWeight: 'bold' as const,
          marginBottom: '16px',
        };
      case 'S':
        return {
          fontSize: '16px',
          fontWeight: 'bold' as const,
          marginBottom: '12px',
        };
      default:
        return {
          fontSize: '20px',
          fontWeight: 'bold' as const,
          marginBottom: '16px',
        };
    }
  };

  const HeaderTag = size === 'XL' ? 'h1' : size === 'L' ? 'h2' : size === 'M' ? 'h3' : 'h4';

  return (
    <HeaderTag 
      style={getSizeStyles()} 
      className={`header-component ${className}`}
    >
      {config.textResourceBindings?.title || 'Header'}
    </HeaderTag>
  );
}

export const HeaderComponent = withFormEngine(HeaderComponentBase);