import React, { memo, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Alert, Radio, Textarea } from '@digdir/designsystemet-react';
import dot from 'dot-object';
import { useStore } from 'zustand';

import { Flex } from 'src/app-components/Flex/Flex';
import { Input } from 'src/app-components/Input/Input';
import { Label } from 'src/app-components/Label/Label';
import classes from 'src/layout/GenericComponent.module.css';
import { RepeatingGroupNext } from 'src/next/components/RepeatingGroupNext';
import { megaStore } from 'src/next/stores/megaStore';
import type { ITextResourceBindings } from 'src/layout/layout';
import type { ResolvedCompExternal } from 'src/next/stores/megaStore';

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

function useTextResource(bindingsOrId: unknown, key?: string) {
  const id = key === undefined ? bindingsOrId : (bindingsOrId as ITextResourceBindings)?.[key];
  return useStore(megaStore, (state) =>
    state.textResource?.resources?.find((r) => r.id === id)
      ? // @ts-ignore
        (state.textResource.resources.find((r) => r.id === id)?.value ?? id)
      : id,
  );
}

function RenderComponentInner({ component, parentBinding, itemIndex, childField }: RenderComponentType) {
  const currentPage = useParams().pageId ?? '';
  const prevPage = useStore(megaStore, (state) => {
    const currentIndex = state.pageOrder.pages.order.findIndex((page) => page === currentPage);
    return state.pageOrder.pages.order[currentIndex - 1];
  });
  const nextPage = useStore(megaStore, (state) => {
    const currentIndex = state.pageOrder.pages.order.findIndex((page) => page === currentPage);
    return state.pageOrder.pages.order[currentIndex + 1];
  });
  const allPages = useStore(megaStore, (state) => state.pageOrder.pages.order);

  const setDataValue = useStore(megaStore, (state) => state.setDataValue);

  const evaluateExpression = useStore(megaStore, (state) => state.evaluateExpression);

  const binding =
    !parentBinding && component.dataModelBindings && component.dataModelBindings['simpleBinding']
      ? component.dataModelBindings['simpleBinding']
      : `${parentBinding}[${itemIndex}]${childField}`;

  const value = useStore(megaStore, (state) => (binding ? dot.pick(binding, state.data) : undefined));

  const ref = useRef<HTMLDivElement>(null);

  const dependentFields = Array.isArray(component.hidden) ? extractDataModelFields(component.hidden) : [];

  const [isHidden, setIsHidden] = useState(false);

  const title = useTextResource(component.textResourceBindings, 'title');

  useEffect(() => {
    megaStore.subscribe(
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
          dependentFields for {component.id} ({component.type}): <pre>{JSON.stringify(dependentFields, null, 2)}</pre>
        </div>
      )}
      {component.type === 'Paragraph' && <p>{title}</p>}

      {component.type === 'Header' && <h1>{title}</h1>}

      {component.type === 'Input' && (
        <Flex className={classes.container}>
          <div
            className={classes.md}
            style={{ display: 'flex' }}
          >
            <Label label={title} />
            <Input
              value={value ?? ''}
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
            <Label label={title} />
            <Textarea
              value={value ?? ''}
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

      {component.type === 'RadioButtons' && (
        <Radio.Group
          legend={title}
          role='radiogroup'
        >
          {component.options?.map((option, idx) => (
            <label
              key={idx}
              style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}
            >
              <Radio
                value={`${option.value}`}
                description={option.description}
                key={idx}
                onChange={(event) => {
                  setDataValue(binding, parseBoolean(event.target.value));
                }}
              />
              {/* eslint-disable-next-line react-hooks/rules-of-hooks */}
              {useTextResource(option.label)}
            </label>
          ))}
        </Radio.Group>
      )}

      {component.type === 'NavigationBar' && (
        <div style={{ display: 'flex', gap: '5px' }}>
          {allPages.map((page) => (
            <button
              key={page}
              onClick={() => (window.location.hash = window.location.hash.replace(currentPage, page))}
              style={{ backgroundColor: page === currentPage ? 'lightblue' : 'white' }}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      {component.type === 'NavigationButtons' && (
        <div>
          {prevPage && (
            <button onClick={() => (window.location.hash = window.location.hash.replace(currentPage, prevPage))}>
              Forrige
            </button>
          )}
          {nextPage && (
            <button onClick={() => (window.location.href = window.location.href.replace(currentPage, nextPage))}>
              Neste
            </button>
          )}
        </div>
      )}

      {component.type === 'Alert' && <Alert>{title}</Alert>}

      {/* Fallback for unknown types */}
      {component.type !== 'Paragraph' &&
        component.type !== 'Header' &&
        component.type !== 'Input' &&
        component.type !== 'RepeatingGroup' &&
        component.type !== 'TextArea' &&
        component.type !== 'Alert' &&
        component.type !== 'RadioButtons' &&
        component.type !== 'NavigationButtons' &&
        component.type !== 'NavigationBar' && (
          <div>
            {component.id} type: {component.type}
          </div>
        )}
    </div>
  );
}

export const RenderComponent = memo(RenderComponentInner);
RenderComponent.displayName = 'RenderComponent';

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
