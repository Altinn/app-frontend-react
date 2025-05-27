import React, { useState } from 'react';

import dot from 'dot-object';
import { useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

import { DataModels } from 'src/features/datamodel/DataModelsProvider';
import { FD } from 'src/features/formData/FormDataWrite';
import { RenderInputComponent } from 'src/next/layout/Input/InputComponent';
import { evaluateExpression } from 'src/next-prev/app/expressions/evaluateExpression';
import { layoutStore } from 'src/next-prev/stores/layoutStore';
import type { IDataModelReference } from 'src/layout/common.generated.next';
import type { ComponentTypeConfigs } from 'src/layout/components.generated.next';
import type { CompExternal, CompTypes, DataObject, ResolvedCompExternal } from 'src/next-prev/stores/layoutStore';

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

type DataModelBindingKeys<T extends CompTypes> = keyof ComponentTypeConfigs[T]['layout']['dataModelBindings'];
type CleanedDataModelBindings<T extends CompTypes> = Record<DataModelBindingKeys<T>, IDataModelReference>;

export function NextGenericComponent({ component, indices }: RenderComponentType) {
  const renderAsSummary = false;

  const store = FD.useStore();

  const [isHidden, setIsHidden] = useState(false);

  const dataType = DataModels.useDefaultDataType();

  store.subscribe((state) => {
    if (!dataType) {
      return;
    }
    const data = state.dataModels[dataType].currentData as DataObject;

    if (!data) {
      throw new Error('no data to evaluate');
    }

    const isHidden = evaluateExpression(component.hidden, data);
    setIsHidden(isHidden);
  });

  if (isHidden) {
    return null;
  }

  switch (component.type) {
    case 'Input': {
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
    }
    default:
      return <div>Unknown component type: {component.type}</div>;
  }
}

export type ComponentProps<T extends CompTypes> = {
  renderAsSummary: boolean;
  component: ResolvedCompExternal<T>;
  indices: number[];
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

export function useCleanDataModelBindings<T extends CompTypes>(
  dataModelBindings: Exclude<ComponentTypeConfigs[T]['layout']['dataModelBindings'], undefined>,
  indices: number[],
): CleanedDataModelBindings<T> {
  const dataType = DataModels.useDefaultDataType();

  if (!dataModelBindings) {
    return {} as CleanedDataModelBindings<T>;
  }

  const result = Object.entries(dataModelBindings).reduce<Record<keyof typeof dataModelBindings, IDataModelReference>>(
    (prev, [key, value]) => {
      if (typeof value === 'string') {
        prev[key] = {
          dataType,
          field: getDataModelPathWithIndices(value, indices),
        };
      } else {
        prev[key] = value;
      }
      return prev;
    },
    {} as Record<keyof typeof dataModelBindings, IDataModelReference>,
  );

  return result;
}

export function getDataModelPathWithIndices(binding: string, indices: number[]) {
  if (indices.length === 0) {
    return binding;
  }

  const splittedBinding = binding.split('.');

  const indexedBinding = indices.map((index, idx) => `${splittedBinding[idx]}[${index}]`).join('.');
  // TODO: handle more than one left?
  const lastSegment = splittedBinding.at(-1);

  return `${indexedBinding}.${lastSegment}`;
}
