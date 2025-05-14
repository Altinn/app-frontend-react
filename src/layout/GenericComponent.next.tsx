import React from 'react';

import dot from 'dot-object';
import { useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

import { DataModels } from 'src/features/datamodel/DataModelsProvider';
import { FD } from 'src/features/formData/FormDataWrite';
import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { useLanguage } from 'src/features/language/useLanguage';
import { layoutStore, type ResolvedCompExternal } from 'src/next/stores/layoutStore';
import type { IDataModelReference } from 'src/layout/common.generated';
import type { CompExternal, CompTypes } from 'src/layout/layout';

export interface RenderComponentType {
  component: ResolvedCompExternal;
  parentBinding?: string;

  childField?: string;
  renderAsSummary?: boolean;
  indices: number[];
}

type RenderComponentByIdProps = {
  id: string;
  indices: number[];
};

export function RenderComponentById({ id, indices }: RenderComponentByIdProps) {
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
  indices: number[];
};
type InputComponent = {
  component: ResolvedCompExternal<'Input'>;
} & CommonInputProps;

function RenderInputComponent({ component, indices }: InputComponent) {
  const textResources = useResolvedTexts<'Input'>(component.textResourceBindings);

  const type = DataModels.useDefaultDataType();

  const bindingAsString = component.dataModelBindings.simpleBinding as unknown as string;

  const dataModelReference: IDataModelReference = {
    dataType: type || '',
    field: getDataModelPathWithIndices(bindingAsString, indices) as unknown as string, // component.dataModelBindings.simpleBinding as unknown as string,
  };

  const {
    formData: { simpleBinding: realFormValue },
    setValue: _,
  } = useDataModelBindings({ simpleBinding: dataModelReference }, 400);

  const setLeafValue = FD.useSetLeafValue();

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setLeafValue({
      reference: dataModelReference,
      newValue: value,
    });
  }

  return (
    <DumbInputComponent
      data={realFormValue}
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
  data: string;

  textResources: ResolvedTexts<'Input'>;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <pre>data: {JSON.stringify(data, null, 2)}</pre>
      <pre>textResources: {JSON.stringify(textResources, null, 2)}</pre>
      <input
        type='text'
        value={data}
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

const getDataModelPathWithIndices = (binding: string, indices: number[]) => {
  if (indices.length === 0) {
    return binding;
  }

  const splittedBinding = binding.split('.');

  const indexedBinding = indices.map((index, idx) => `${splittedBinding[idx]}[${index}]`).join('.');
  const lastSegment = splittedBinding.at(-1);

  return `${indexedBinding}.${lastSegment}`;
};

function useResolvedData<T extends CompTypes>(
  dataModelBindings: CompExternal<T>['dataModelBindings'],
  indices: number[],
): ResolvedData<T> {
  const value = useStore(
    layoutStore,
    useShallow((state) => {
      if (!dataModelBindings) {
        return {};
      }

      const resolvedData = {};
      Object.entries(dataModelBindings).forEach(([key, value]) => {
        resolvedData[key] = state.data ? dot.pick(getDataModelPathWithIndices(value, indices), state.data) : undefined;
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
