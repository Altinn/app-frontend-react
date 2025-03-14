import React, { memo, useEffect, useRef, useState } from 'react';

import { Alert, Radio, Textarea } from '@digdir/designsystemet-react';
import dot from 'dot-object';
import { useStore } from 'zustand';

import { Flex } from 'src/app-components/Flex/Flex';
import { Input } from 'src/app-components/Input/Input';
import { Label } from 'src/app-components/Label/Label';
import { Lang } from 'src/features/language/Lang';
import classes from 'src/layout/GenericComponent.module.css';
import { RepeatingGroupNext } from 'src/next/components/RepeatingGroupNext';
import { layoutStore } from 'src/next/stores/layoutStore';
import { textResourceStore } from 'src/next/stores/textResourceStore';
import type { ResolvedCompExternal } from 'src/next/stores/layoutStore';

interface RenderComponentType {
  component: ResolvedCompExternal;
  parentBinding?: string;
  itemIndex?: number;
  childField?: string;
}

function parseBoolean(value: string): boolean {
  return ['true', '1'].includes(value.toLowerCase());
}

export function extractDataModelFields(expression: any[]): string[] {
  const fields: string[] = [];

  function recurse(item: any) {
    if (Array.isArray(item)) {
      // If this array starts with 'dataModel', the next item is a field
      if (item[0] === 'dataModel' && typeof item[1] === 'string') {
        fields.push(item[1]);
      }
      // Recurse into each child element
      for (const child of item) {
        recurse(child);
      }
    }
  }

  recurse(expression);
  return fields;
}

export const RenderComponent = memo(function RenderComponent({
  component,
  parentBinding,
  itemIndex,
  childField,
}: RenderComponentType) {
  const setDataValue = useStore(layoutStore, (state) => state.setDataValue);

  const evaluateExpression = useStore(layoutStore, (state) => state.evaluateExpression);

  const binding =
    !parentBinding && component.dataModelBindings && component.dataModelBindings['simpleBinding']
      ? component.dataModelBindings['simpleBinding']
      : `${parentBinding}[${itemIndex}]${childField}`;

  const value = useStore(layoutStore, (state) => (binding ? dot.pick(binding, state.data) : undefined));

  const ref = useRef<HTMLDivElement>(null);

  const dependentFields = Array.isArray(component.hidden) ? extractDataModelFields(component.hidden) : [];

  const [isHidden, setIsHidden] = useState(false);

  const textResource = useStore(textResourceStore, (state) =>
    component.textResourceBindings && component.textResourceBindings['title'] && state.textResource?.resources
      ? // @ts-ignore
        state.textResource.resources.find((r) => r.id === component.textResourceBindings['title']) //dot.pick(component.textResourceBindings['title'], state.textResource)
      : undefined,
  );

  useEffect(() => {
    layoutStore.subscribe(
      (state) => dependentFields.map((path) => dot.pick(path, state.data)),
      () => {
        if (Array.isArray(component.hidden)) {
          // @ts-ignore
          const isHidden = evaluateExpression(component.hidden);
          setIsHidden(isHidden);
        }
      },
    );
  }, [component.hidden, dependentFields, evaluateExpression]);

  if (isHidden) {
    return <h1>Im hidden!! {component.id}</h1>;
  }

  return (
    <div
      ref={ref}
      key={component.id}
    >
      {/*<pre>{JSON.stringify(values, null, 2)}</pre>*/}

      {dependentFields.length > 0 && (
        <div>
          dependentFields <pre>{JSON.stringify(dependentFields, null, 2)}</pre>
        </div>
      )}
      {component.type === 'Paragraph' && <p>{textResource?.value}</p>}

      {component.type === 'Header' && <h1>{textResource?.value}</h1>}

      {component.type === 'Input' && (
        <Flex className={classes.container}>
          <div
            className={classes.md}
            style={{ display: 'flex' }}
          >
            <Label label={textResource?.value || ''} />
            <Input
              value={value}
              onChange={(e) => {
                if (binding) {
                  // @ts-ignore
                  setDataValue(binding, e.target.value);
                }
              }}
            />
          </div>
        </Flex>
      )}

      {component.type === 'TextArea' && (
        <Flex className={classes.container}>
          <div
            className={classes.md}
            style={{ display: 'flex' }}
          >
            <Label label={textResource?.value || ''} />
            <Textarea
              value={value}
              onChange={(e) => {
                if (binding) {
                  // @ts-ignore
                  setDataValue(binding, e.target.value);
                }
              }}
            />
          </div>
        </Flex>
      )}

      {component.type === 'RepeatingGroup' && <RepeatingGroupNext component={component} />}

      {component.type === 'Alert' && <div>{textResource?.value}</div>}

      {component.type === 'RadioButtons' && (
        <Radio.Group
          legend='temp'
          role='radiogroup'
        >
          {component.options?.map((option, idx) => (
            <Radio
              value={`${option.value}`}
              description={option.description && <Lang id={option.description} />}
              key={idx}
              onChange={(event) => {
                setDataValue(binding, parseBoolean(event.target.value));
              }}
            />
          ))}
        </Radio.Group>
      )}

      {component.type === 'Alert' && <Alert>You are using the Alert component!</Alert>}

      {/* Fallback for unknown types */}
      {component.type !== 'Paragraph' &&
        component.type !== 'Header' &&
        component.type !== 'Input' &&
        component.type !== 'RepeatingGroup' && (
          <div>
            {component.id} type: {component.type}
          </div>
        )}
    </div>
  );

  // const allComps = getComponentConfigs();
  //
  // debugger;

  // @ts-ignore
  //const renderComponent = useStore(initialStateStore, (state) => state.componentConfigs[component.type]);
  // const allComps = getComponentConfigs();
  //
  // debugger;

  // @ts-ignore
  //const renderComponent = useStore(initialStateStore, (state) => state.componentConfigs[component.type]);

  //const evaluateExpression = useStore(layoutStore, (state) => state.evaluateExpression);

  // useEffect(() => {
  //   if (Array.isArray(component.hidden)) {
  //     // @ts-ignore
  //     const isHidden = component.isHidden !== undefined ? evaluateExpression(component.hidden) : false;
  //     const fields = extractDataModelFields(component.hidden);
  //   }
  // }, [component.isHidden, evaluateExpression]);

  // if (component.type === 'Paragraph') {
  //   return <p key={component.id}>{textResource?.value}</p>;
  // }
  //
  // if (component.type === 'Header') {
  //   return <h1 key={component.id}>{textResource?.value}</h1>;
  // }
  //
  // if (component.type === 'Input') {
  //   return (
  //     <Flex
  //       key={component.id}
  //       className={classes.container}
  //     >
  //       <div
  //         className={classes.md}
  //         style={{ display: 'flex' }}
  //       >
  //         <Label label={textResource?.value || ''} />
  //         <Input
  //           value={value}
  //           onChange={(e) => {
  //             if (binding) {
  //               // @ts-ignore
  //               setDataValue(binding, e.target.value);
  //             }
  //           }}
  //         />
  //       </div>
  //     </Flex>
  //   );
  // }
  //
  // if (component.type === 'RepeatingGroup') {
  //   return <RepeatingGroupNext component={component} />;
  // }
  //
  // return (
  //   <div key={component.id}>
  //     {component.id} type: {component.type}
  //   </div>
  // );
});
