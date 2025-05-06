import React, { memo, useState } from 'react';

import { useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

import { Flex } from 'src/app-components/Flex/Flex';
import { FD } from 'src/features/formData/FormDataWrite';
// 👇  pull the hooks that createZustandContext gave you
// import {
//   // the raw StoreApi if you need .getState() / .setState() etc.
//   useStore as useFdStore,
// } from 'src/features/formData/FormDataWrite';
import { areEqualIgnoringOrder } from 'src/next/app/utils/arrayCompare';
import { CheckboxesNext } from 'src/next/components/CheckboxesNext/CheckboxesNext';
import { Navbar } from 'src/next/components/navbar/Navbar';
import { RadioButtonsNext } from 'src/next/components/RadioButtonsNext/RadioButtonsNext';
import { RepeatingGroupNext } from 'src/next/components/RepeatingGroupNext/RepeatingGroupNext';
import { SummaryNext } from 'src/next/components/SummaryNext/SummaryNext';
import { layoutStore } from 'src/next/stores/layoutStore';
import { initialStateStore } from 'src/next/stores/settingsStore';
import { textResourceStore } from 'src/next/stores/textResourceStore';
import type { CompIntermediateExact, CompTypes } from 'src/layout/layout';
import type { LayoutComponent } from 'src/layout/LayoutComponent';
import type { ResolvedCompExternal } from 'src/next/stores/layoutStore';

export interface RenderComponentType {
  component: ResolvedCompExternal;
  parentBinding?: string;
  itemIndex?: number;
  childField?: string;
  renderAsSummary?: boolean;
}

export interface RenderComponentByIdType {
  id: string;
}

export function RenderComponentById({ id }: { id: string }) {
  const component = useStore(layoutStore, (state) => state.componentMap && state.componentMap[id]);

  if (!component) {
    throw new Error('could no find component');
  }

  return <RenderComponent component={component} />;
}

export const RenderComponent = memo(function RenderComponentMemo<Type extends CompTypes = CompTypes>({
  component,
  parentBinding,
  itemIndex,
  childField,
  renderAsSummary,
}: RenderComponentType) {
  const setBoundValue = useStore(layoutStore, (state) => state.setBoundValue);

  // const fdStore = useFdStore();
  const setLeafValue = FD.useSetLeafValue();

  const storeOptions = useStore(layoutStore, (state) => state.options);

  const order = useStore(layoutStore, (state) => state.pageOrder);

  const optionsFromStore =
    component.type === 'RadioButtons' && component.optionsId && storeOptions && storeOptions[component.optionsId]
      ? storeOptions[component.optionsId]
      : [];

  const components = useStore(initialStateStore, (state) => state.componentConfigs);

  if (!components) {
    throw new Error('component to render not found');
  }

  if (!components[component.type]) {
    throw new Error(`${component.type} was not in the component array.`);
  }

  const layoutComponent = components[component.type].def as unknown as LayoutComponent<Type>;
  const RenderComponent = renderAsSummary ? layoutComponent.renderSummaryNext : layoutComponent.renderNext;

  const value = useStore(
    layoutStore,
    useShallow((state) => state.getBoundValue(component, parentBinding, itemIndex, childField)),
  );

  const isHidden = useStore(layoutStore, (state) => {
    if (!component.hidden) {
      return false;
    }
    // @ts-ignore
    return state.evaluateExpression(component.hidden, parentBinding, itemIndex);
  });

  const [errors, setErrors] = useState<string[]>([]);

  useStore(layoutStore, (state) => {
    const newErrors = state.validateComponent(component, parentBinding, itemIndex, childField);

    if (!areEqualIgnoringOrder(errors, newErrors)) {
      setErrors(newErrors);
    }
  });

  const textResource = useStore(textResourceStore, (state) =>
    component.textResourceBindings && component.textResourceBindings['title'] && state.textResource?.resources
      ? // @ts-ignore
        state.textResource.resources.find((r) => r.id === component.textResourceBindings['title'])
      : undefined,
  );

  const commonProps = {
    onChange: (nextValue) => {
      console.log('nextValue', nextValue);

      setBoundValue(component, nextValue, parentBinding, itemIndex, childField);

      setLeafValue({
        reference: {
          dataType: 'model',
          // @ts-ignore
          field: component.dataModelBindings.simpleBinding,
        },
        newValue: nextValue,
      });
    },
    currentValue: value,
    label: textResource?.value || undefined,
    options: optionsFromStore,
    pageOrder: order.pages.order,
  };

  if (component.type === 'Checkboxes') {
    return (
      <CheckboxesNext
        component={component}
        commonProps={commonProps}
      />
    );
  }

  if (component.type === 'RadioButtons') {
    return (
      <RadioButtonsNext
        component={component}
        commonProps={commonProps}
      />
    );
  }

  if (isHidden) {
    return <div>Im hidden!</div>;
  }

  if (component.type === 'RepeatingGroup') {
    return (
      <RepeatingGroupNext
        component={component}
        parentBinding={parentBinding}
        itemIndex={itemIndex}
      />
    );
  }

  if (component.type === 'Summary2') {
    return (
      <SummaryNext
        component={component}
        summaryComponent={component as unknown as CompIntermediateExact<'Summary2'>}
      />
    );
  }

  if (!RenderComponent) {
    return <h1>Not implemented {component.type}</h1>;
  }

  if (component.type === 'NavigationBar') {
    return <Navbar component={component} />;
  }

  return (
    <>
      {/*<pre>{JSON.stringify(binding, null, 2)}</pre>*/}

      <Flex
        id={`form-content-${component.id}`}
        size={{ xs: 12, ...component.grid?.innerGrid }}
        item
      >
        {RenderComponent(component as unknown as CompIntermediateExact<Type>, commonProps)}
      </Flex>
    </>
  );
});
