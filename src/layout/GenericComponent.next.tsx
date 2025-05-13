import React from 'react';

import dot from 'dot-object';
import { useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

import { useLanguage } from 'src/features/language/useLanguage';
import { layoutStore, type ResolvedCompExternal } from 'src/next/stores/layoutStore';
import type { CompExternal, CompTypes } from 'src/layout/layout';

export interface RenderComponentType {
  component: ResolvedCompExternal;
  parentBinding?: string;

  childField?: string;
  renderAsSummary?: boolean;
  indices: number[] | undefined;
}

export function RenderComponentById({ id, indices }: { id: string; indices }) {
  const component = useStore(layoutStore, (state) => state.componentMap && state.componentMap[id]);

  if (!component) {
    throw new Error('could not find component');
  }

  return (
    <NextGenericComponent
      component={component}
      indices={indices}
    />
  );
}

export function NextGenericComponent({ component, indices }: RenderComponentType) {
  const isHidden = false;
  const renderAsSummary = false;

  console.log('component', component.dataModelBindings);

  if (isHidden) {
    return null;
  }

  switch (component.type) {
    case 'Input':
      return (
        <>
          <span>{`component.dataModelBindings: ${JSON.stringify(component.dataModelBindings, null, 2)} `}</span>

          <RenderInputComponent
            component={component}
            renderAsSummary={renderAsSummary}
            indices={indices}
          />
        </>
      );
    default:
      return <div>Unknown component type: {component.type}</div>;
  }
}

type CommonInputProps = {
  renderAsSummary: boolean;
  indices: number[] | undefined;
};
type InputComponent = {
  component: ResolvedCompExternal<'Input'>;
} & CommonInputProps;

function RenderInputComponent({ component, indices }: InputComponent) {
  const data = useResolvedData<'Input'>(component.dataModelBindings, indices);
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

const getDataModelPath = (binding: string, itemIndex?: number) => {
  console.log('itemIndex', itemIndex);

  if (!itemIndex) {
    return binding;
  }
  const splittedBinding = binding.split('.');

  if (splittedBinding.length === 0) {
    return binding;
  }

  const base = splittedBinding.slice(0, splittedBinding.length - 1).join('.');

  return `${base}[${itemIndex}].${splittedBinding.at(-1)}`;
};

const getDataModelPathIndeces = (binding: string, indices?: number[]) => {
  if (!indices) {
    return binding;
  }

  if (indices.length === 0) {
    return binding;
  }

  const splittedBinding = binding.split('.');

  return `${indices.map((index, idx) => `${splittedBinding[idx]}[${index}]`).join('.')}.${splittedBinding.at(-1)}`;
};

function useResolvedData<T extends CompTypes>(
  dataModelBindings: CompExternal<T>['dataModelBindings'],
  indices: number[] | undefined,
): ResolvedData<T> {
  const value = useStore(
    layoutStore,
    useShallow((state) => {
      if (!dataModelBindings) {
        return {};
      }

      const resolvedData = {};
      Object.entries(dataModelBindings).forEach(([key, value]) => {
        resolvedData[key] = state.data ? dot.pick(getDataModelPathIndeces(value, indices), state.data) : undefined;
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
