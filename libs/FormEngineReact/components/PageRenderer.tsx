import React from 'react';

import { FormRenderer } from 'libs/FormEngineReact/components/FormRenderer';
import { useEngine } from 'libs/FormEngineReact/FormEngineProvider';

interface PageRendererProps {
  pageId?: string;
}

export function PageRenderer({ pageId }: PageRendererProps) {
  const engine = useEngine();

  const currentPageId = pageId || engine.layout.getCurrentPage();

  if (!currentPageId) {
    return (
      <div className='page-renderer'>
        <p>No page to render</p>
      </div>
    );
  }

  return (
    <div
      className='page-renderer'
      data-page-id={currentPageId}
    >
      <FormRenderer pageId={currentPageId} />
    </div>
  );
}
