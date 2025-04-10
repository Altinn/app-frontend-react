import React from 'react';
import type { FunctionComponent } from 'react';

import { useStore } from 'zustand';

import { RenderComponent } from 'src/next/components/RenderComponent';
import { layoutStore } from 'src/next/stores/layoutStore';
import type { CompIntermediateExact } from 'src/layout/layout';
import type { RenderComponentType } from 'src/next/components/RenderComponent';

interface LayoutSetSummaryNextType {
  pageKey?: string;
}

const LayoutSetSummaryNext: React.FunctionComponent<LayoutSetSummaryNextType> = ({ pageKey }) => {
  console.log('pageKey', pageKey);
  const layoutSet = useStore(layoutStore, (state) => state.layouts);

  return <pre>{JSON.stringify(layoutSet, null, 2)}</pre>;
};

interface ComponentSummaryNextType {
  componentId: string;
}

const ComponentSummaryNext: React.FunctionComponent<ComponentSummaryNextType> = ({ componentId }) => {
  const summaryComponent = useStore(layoutStore, (state) => {
    if (!state.componentMap) {
      throw new Error('no component map');
    }

    return state.componentMap[componentId];
  });

  return (
    <RenderComponent
      component={summaryComponent}
      renderAsSummary={true}
    />
  );
};

interface SummaryNextProps extends RenderComponentType {
  summaryComponent: CompIntermediateExact<'Summary2'>;
}

export const SummaryNext: FunctionComponent<SummaryNextProps> = ({ component, summaryComponent }) => {
  console.log('component', component);
  const { target } = summaryComponent;
  if (!target?.id) {
    return <LayoutSetSummaryNext />;
  }

  if (target.type === 'layoutSet') {
    return <LayoutSetSummaryNext />;
  }

  if (target.type === 'page') {
    return <LayoutSetSummaryNext pageKey={target.id} />;
  }

  return <ComponentSummaryNext componentId={target.id} />;
};
