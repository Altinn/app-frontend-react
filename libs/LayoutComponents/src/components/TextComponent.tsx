import React from 'react';

interface TextComponentProps {
  id: string;
  textResourceBindings?: {
    title?: string;
  };
}

export function TextComponent({ textResourceBindings }: TextComponentProps) {
  return (
    <div style={{ marginBottom: '16px' }}>
      {textResourceBindings?.title && (
        <p style={{ margin: 0 }}>
          {textResourceBindings.title}
        </p>
      )}
    </div>
  );
}