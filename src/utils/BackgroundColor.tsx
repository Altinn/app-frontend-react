import React from 'react';
import { Helmet } from 'react-helmet-async';

export function BackgroundColor({ color }: { color: string }) {
  return (
    <Helmet>
      <style>{`html > body { background-color: ${color}; }`}</style>
    </Helmet>
  );
}
