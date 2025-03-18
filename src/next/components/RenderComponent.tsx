import React, { memo, useEffect, useMemo, useRef, useState } from 'react';

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

export function extractDependentFields(expression: any, componentMap?: Record<string, ResolvedCompExternal>): string[] {
  console.log('extractDependentFields', extractDependentFields);
  const fields: string[] = [];

  function recurse(expr: any) {
    if (!Array.isArray(expr)) {
      return;
    }

    const [operator, ...params] = expr;

    switch (operator) {
      case 'dataModel': {
        // usage: ["dataModel", "someField"]
        const fieldName = params[0];
        if (typeof fieldName === 'string') {
          fields.push(fieldName);
        }
        break;
      }

      case 'component': {
        // usage: ["component", "someId"]
        const compId = params[0];
        if (componentMap && typeof compId === 'string') {
          const comp = componentMap[compId];
          if (comp) {
            // Suppose we only care about the simpleBinding
            // @ts-ignore
            const binding = comp.dataModelBindings?.simpleBinding;
            if (binding) {
              fields.push(binding);
            }
          }
        }
        break;
      }

      default: {
        // Recursively handle sub-expressions (e.g. ["equals", exprA, exprB])
        for (const childExpr of params) {
          recurse(childExpr);
        }
        break;
      }
    }
  }

  recurse(expression);
  return fields;
}

// export function extractDataModelFields(expression: any[]): string[] {
//   const fields: string[] = [];
//
//   function recurse(item: any) {
//     if (Array.isArray(item)) {
//       // If this array starts with 'dataModel', the next item is a field
//       if (item[0] === 'dataModel' && typeof item[1] === 'string') {
//         fields.push(item[1]);
//       }
//       // Recurse into each child element
//       for (const child of item) {
//         recurse(child);
//       }
//     }
//   }
//
//   recurse(expression);
//   return fields;
// }

export const RenderComponent = memo(function RenderComponent({
  component,
  parentBinding,
  itemIndex,
  childField,
}: RenderComponentType) {
  const setDataValue = useStore(layoutStore, (state) => state.setDataValue);

  const evaluateExpression = useStore(layoutStore, (state) => state.evaluateExpression);

  const componentMap = useStore(layoutStore, (s) => s.componentMap);

  // @ts-ignore
  const dependentFields = useMemo(() => {
    if (Array.isArray(component.hidden) && componentMap) {
      return extractDependentFields(component.hidden, componentMap);
    }
    return [];
  }, [component.hidden, componentMap]);

  console.log('dependentFields', dependentFields);

  // @ts-ignore
  //const isHidden = useExpression(component.hidden, false);

  const binding =
    !parentBinding && component.dataModelBindings && component.dataModelBindings['simpleBinding']
      ? component.dataModelBindings['simpleBinding']
      : `${parentBinding}[${itemIndex}]${childField}`;

  const value = useStore(layoutStore, (state) => (binding ? dot.pick(binding, state.data) : undefined));

  const ref = useRef<HTMLDivElement>(null);

  //const dependentFields = Array.isArray(component.hidden) ? extractDataModelFields(component.hidden) : [];

  const [isHidden, setIsHidden] = useState(false);

  const textResource = useStore(textResourceStore, (state) =>
    component.textResourceBindings && component.textResourceBindings['title'] && state.textResource?.resources
      ? // @ts-ignore
        state.textResource.resources.find((r) => r.id === component.textResourceBindings['title']) //dot.pick(component.textResourceBindings['title'], state.textResource)
      : undefined,
  );

  useEffect(() => {
    if (dependentFields.length > 0) {
      layoutStore.subscribe(
        (state) => dependentFields.map((path) => dot.pick(path, state.data)),
        () => {
          if (Array.isArray(component.hidden)) {
            console.log('clicky');
            // @ts-ignore
            const isHidden = evaluateExpression(component.hidden);
            setIsHidden(isHidden);
          }
        },
      );
    }
  }, [dependentFields.length]);

  useEffect(() => {
    console.log('isHidden', isHidden);
  }, [isHidden]);

  if (isHidden) {
    return <div>Im hidden!</div>;
  }

  return (
    <div
      ref={ref}
      key={component.id}
    >
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
        <div>
          <Radio.Group
            legend=''
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
              >
                {option.label}
              </Radio>
            ))}
          </Radio.Group>
        </div>
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
});
