import React from 'react';

import { useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

import { useLanguage } from 'src/features/language/useLanguage';
import { layoutStore, type ResolvedCompExternal } from 'src/next/stores/layoutStore';
import type { CompExternal, CompTypes } from 'src/layout/layout';

export interface RenderComponentType {
  component: ResolvedCompExternal;
  parentBinding?: string;
  itemIndex?: number;
  childField?: string;
  renderAsSummary?: boolean;
}

export function RenderComponentById({ id }: { id: string }) {
  const component = useStore(layoutStore, (state) => state.componentMap && state.componentMap[id]);

  if (!component) {
    throw new Error('could not find component');
  }

  return <NextGenericComponent component={component} />;
}

export function NextGenericComponent({ component }: RenderComponentType) {
  const isHidden = false;
  const renderAsSummary = false;

  if (isHidden) {
    return null;
  }

  switch (component.type) {
    case 'Input':
      return (
        <RenderInputComponent
          component={component}
          renderAsSummary={renderAsSummary}
        />
      );
    default:
      return <div>Unknown component type: {component.type}</div>;
  }
}

type CommonInputProps = {
  renderAsSummary: boolean;
};
type InputComponent = {
  component: ResolvedCompExternal<'Input'>;
} & CommonInputProps;

function RenderInputComponent({ component }: InputComponent) {
  const data = useResolvedData<'Input'>(component.dataModelBindings);
  const textResources = useResolvedTexts<'Input'>(component.textResourceBindings);
  const setBoundValue = useStore(layoutStore, (state) => state.setBoundValue);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setBoundValue(component, value);
  }

  return (
    <DumbInputComponent
      data={data}
      textResources={textResources}
      onChange={handleChange}
    />
  );
}

function DumbInputComponent({
  data,
  textResources,
  onChange,
}: {
  data: ResolvedData<'Input'>;
  textResources: ResolvedTexts<'Input'>;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <pre>data: {JSON.stringify(data, null, 2)}</pre>
      <pre>textResources: {JSON.stringify(textResources, null, 2)}</pre>
      <input
        type='text'
        value={data?.simpleBinding}
        onChange={(event) => {
          onChange(event);
        }}
      />
    </div>
  );
}

type ResolvedData<T extends CompTypes> =
  | Record<keyof NonNullable<CompExternal<T>['dataModelBindings']>, string>
  | undefined;

function useResolvedData<T extends CompTypes>(
  dataModelBindings: CompExternal<T>['dataModelBindings'],
): ResolvedData<T> {
  const value = useStore(
    layoutStore,
    useShallow((state) => {
      if (!dataModelBindings) {
        return {};
      }

      const resolvedData = {};
      Object.entries(dataModelBindings).forEach(([key, value]) => {
        resolvedData[key] = state.data ? state.data[value] : undefined;
      });
      return resolvedData;
    }),
  );
  return value as ResolvedData<T>;
}

type ResolvedTexts<T extends CompTypes> =
  | Record<keyof NonNullable<CompExternal<T>['textResourceBindings']>, string>
  | undefined;
function useResolvedTexts<T extends CompTypes>(
  textResourceBindings: CompExternal<T>['textResourceBindings'],
): ResolvedTexts<T> {
  const { langAsString } = useLanguage();
  if (!textResourceBindings) {
    return undefined;
  }

  const resolvedTexts = {};

  Object.entries(textResourceBindings).forEach(([key, value]) => {
    resolvedTexts[key] = langAsString(value);
  });

  return resolvedTexts as ResolvedTexts<T>; // FIXME:
}
