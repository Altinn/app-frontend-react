import React from 'react';
import { useParams } from 'react-router-dom';

import { useLayoutPage } from 'src/POC/hooks/useLayout';
import type { ConvertedComponent } from 'src/POC/utils/convertLayout';

export function FormPage() {
  const { taskId, pageId } = useParams();
  const { data: formPage, isLoading, error } = useLayoutPage(taskId, pageId);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!formPage) {
    return <div>Page not found</div>;
  }

  return <form>{formPage.data.layout.map((component) => renderComponent(component))}</form>;
}

function renderComponent(component: ConvertedComponent) {
  switch (component.type) {
    case 'Input':
      return <input key={component.id} />;
    case 'Button':
      return <button key={component.id} />;
    default:
      return <pre>{JSON.stringify(component, undefined, 2)}</pre>;
  }
}
