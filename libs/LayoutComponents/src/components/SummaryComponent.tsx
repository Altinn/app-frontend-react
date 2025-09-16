import React from 'react';
import type { FunctionComponent } from 'react';

import { useComponentData, useComponentValidation, useComponentVisibility } from 'libs/FormEngineReact/hooks';
import type { BaseComponent } from 'libs/FormEngine/types';

interface SummaryComponentProps {
  component: BaseComponent;
  parentBinding?: string;
  itemIndex?: number;
  className?: string;
}

interface LayoutSetSummaryProps {
  pageKey?: string;
}

const LayoutSetSummary: React.FunctionComponent<LayoutSetSummaryProps> = () => (
  // TODO: Implement proper layout set summary using FormEngine
  <div>Layout Set Summary - TODO: Implement with FormEngine</div>
);
interface ComponentSummaryProps {
  componentId: string;
}

const ComponentSummary: React.FunctionComponent<ComponentSummaryProps> = ({ componentId }) => (
  // TODO: Implement proper component summary using FormEngine
  <div>Component Summary for {componentId} - TODO: Implement with FormEngine</div>
);
export const SummaryComponent: FunctionComponent<SummaryComponentProps> = ({ component, parentBinding, itemIndex }) => {
  const { value, updateValue } = useComponentData(component, parentBinding, itemIndex);
  const { errors, isValid } = useComponentValidation(component, parentBinding, itemIndex);
  const isVisible = useComponentVisibility(component.id);

  if (!isVisible) {
    return null;
  }

  // Cast component to get Summary2-specific properties
  const summaryConfig = component as any;
  const { target } = summaryConfig;

  if (!target) {
    return <LayoutSetSummary />;
  }

  if (target?.type === 'layoutSet') {
    return <LayoutSetSummary />;
  }

  if (target?.type === 'page') {
    return <LayoutSetSummary pageKey={target.id} />;
  }

  return <ComponentSummary componentId={target.id} />;
};
