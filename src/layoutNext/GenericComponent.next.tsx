import React from 'react';

import dot from 'dot-object';
import { useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

import { DataModels } from 'src/features/datamodel/DataModelsProvider';
import { useLanguage } from 'src/features/language/useLanguage';
import { RenderInputComponent } from 'src/layoutNext/Input/InputComponent';
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

export function getDataModelPathWithIndices(binding: string, indices: number[]) {
  if (indices.length === 0) {
    return binding;
  }

  const splittedBinding = binding.split('.');

  const indexedBinding = indices.map((index, idx) => `${splittedBinding[idx]}[${index}]`).join('.');
  const lastSegment = splittedBinding.at(-1);

  return `${indexedBinding}.${lastSegment}`;
}

type CleanedDataModelBindings<T extends CompTypes> = Record<
  keyof Exclude<CompExternal<T>['dataModelBindings'], undefined>,
  IDataModelReference
>;

function cleanDataModelBindings<T extends CompTypes = CompTypes>(
  dataModelBindings: CompExternal<T>['dataModelBindings'],
  dataType: string | undefined,
  indices: number[],
): CleanedDataModelBindings<T> | undefined {
  if (!dataModelBindings || !dataType) {
    return undefined;
  }

  const result: CleanedDataModelBindings<T> = {} as CleanedDataModelBindings<T>;

  Object.entries(dataModelBindings).forEach(([key, value]) => {
    if (typeof value === 'string') {
      result[key] = {
        dataType,
        field: getDataModelPathWithIndices(value, indices),
      };
    } else {
      result[key] = value;
    }
  });

  return result;
}

export function NextGenericComponent({ component, indices }: RenderComponentType) {
  const isHidden = false;
  const renderAsSummary = false;
  const dataType = DataModels.useDefaultDataType();

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
            cleanedDataModelBindings={cleanDataModelBindings(component.dataModelBindings, dataType, indices)}
            renderAsSummary={renderAsSummary}
          />
        </>
      );
    default:
      return <div>Unknown component type: {component.type}</div>;
  }
}

export type ComponentProps<T extends CompTypes> = {
  renderAsSummary: boolean;
  component: ResolvedCompExternal<T>;
  cleanedDataModelBindings: CleanedDataModelBindings<T> | undefined;
};

type ResolvedData<T extends CompTypes> =
  | Record<keyof NonNullable<CompExternal<T>['dataModelBindings']>, string>
  | undefined;

export function useResolvedData<T extends CompTypes>(
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

export type ResolvedTexts<T extends CompTypes> =
  | Record<keyof NonNullable<CompExternal<T>['textResourceBindings']>, string>
  | undefined;

export function useResolvedTexts<T extends CompTypes>(
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
