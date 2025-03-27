import React, { memo, useState } from 'react';

import { useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

import { Flex } from 'src/app-components/Flex/Flex';
import { areEqualIgnoringOrder } from 'src/next/app/utils/arrayCompare';
import { Navbar } from 'src/next/components/navbar/Navbar';
import { RepeatingGroupNext } from 'src/next/components/RepeatingGroupNext';
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

export const RenderComponent = memo(function RenderComponentMemo<Type extends CompTypes = CompTypes>({
  component,
  parentBinding,
  itemIndex,
  childField,
  renderAsSummary,
}: RenderComponentType) {
  const setBoundValue = useStore(layoutStore, (state) => state.setBoundValue);

  const components = useStore(initialStateStore, (state) => state.componentConfigs);

  if (!components) {
    throw new Error('component to render not found');
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
        state.textResource.resources.find((r) => r.id === component.textResourceBindings['title']) //dot.pick(component.textResourceBindings['title'], state.textResource)
      : undefined,
  );

  if (isHidden) {
    return <div>Im hidden!</div>;
  }

  if (component.type === 'RepeatingGroup') {
    return <RepeatingGroupNext component={component} />;
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
    <Flex
      id={`form-content-${component.id}`}
      size={{ xs: 12, ...component.grid?.innerGrid }}
      item
    >
      {RenderComponent(component as unknown as CompIntermediateExact<Type>, {
        onChange: (nextValue) => {
          setBoundValue(component, nextValue, parentBinding, itemIndex, childField);
        },
        currentValue: value,
        label: textResource?.value || undefined,
      })}
    </Flex>
  );

  //return <RenderComponent ></RenderComponent>

  //return <div>{RenderComponent.def.renderNext(component as unknown as LayoutComponent<Type>)}</div>;

  // return (
  //   <div id={component.id}>
  //     {component.type === 'Paragraph' && <p>{textResource?.value}</p>}
  //
  //     {component.type === 'Header' && <h1>{textResource?.value}</h1>}
  //
  //     {component.type === 'Input' && (
  //       <Flex className={classes.container}>
  //         <div
  //           className={classes.md}
  //           style={{ display: 'flex' }}
  //         >
  //           <Label label={textResource?.value || ''} />
  //           <Input
  //             value={value}
  //             error={errors.length > 0 ? errors[0] : null}
  //             onChange={(e) => {
  //               setBoundValue(component, e.target.value, parentBinding, itemIndex, childField);
  //             }}
  //           />
  //         </div>
  //       </Flex>
  //     )}
  //
  //     {component.type === 'TextArea' && (
  //       <Flex className={classes.container}>
  //         <div
  //           className={classes.md}
  //           style={{ display: 'flex' }}
  //         >
  //           {/*<Label label={textResource?.value || ''} />*/}
  //           <Textarea
  //             value={value}
  //             onChange={(e) => {
  //               setBoundValue(component, e.target.value, parentBinding, itemIndex, childField);
  //             }}
  //           />
  //         </div>
  //       </Flex>
  //     )}
  //
  //     {component.type === 'RepeatingGroup' && <RepeatingGroupNext component={component} />}
  //
  //     {component.type === 'RadioButtons' && (
  //       <div>
  //         <Radio.Group
  //           legend=''
  //           role='radiogroup'
  //         >
  //           {component.options?.map((option, idx) => (
  //             <Radio
  //               value={`${option.value}`}
  //               description={option.description}
  //               key={idx}
  //               onChange={(e) => {
  //                 setBoundValue(component, e.target.value, parentBinding, itemIndex, childField);
  //               }}
  //             >
  //               {option.label}
  //             </Radio>
  //           ))}
  //         </Radio.Group>
  //       </div>
  //     )}
  //
  //     {component.type === 'Checkboxes' && (
  //       <div>
  //         <Checkbox.Group
  //           legend=''
  //           role='radiogroup'
  //         >
  //           {component.options?.map((option, idx) => (
  //             <Checkbox
  //               key={idx}
  //               description={option.description}
  //               value={`${option.value}`}
  //               size='small'
  //               onChange={(e) => {
  //                 setBoundValue(component, e.target.value, parentBinding, itemIndex, childField);
  //               }}
  //             >
  //               <span>
  //                 {option.label}
  //                 {option.value}
  //               </span>
  //             </Checkbox>
  //           ))}
  //         </Checkbox.Group>
  //       </div>
  //     )}
  //
  //     {component.type === 'Alert' && <Alert>You are using the Alert component!</Alert>}
  //
  //     {component.type === 'CustomButton' && component.actions[0].type === 'ClientAction' && (
  //       <button
  //         onClick={() => {
  //           if (component.actions[0].type === 'ClientAction') {
  //             // @ts-ignore
  //             navigate(component.actions[0].metadata.page);
  //           }
  //         }}
  //       />
  //     )}
  //
  //     {component.type !== 'Paragraph' &&
  //       component.type !== 'Header' &&
  //       component.type !== 'Input' &&
  //       component.type !== 'RepeatingGroup' && (
  //         <div>
  //           {component.id} type: {component.type}
  //         </div>
  //       )}
  //   </div>
  // );
});
