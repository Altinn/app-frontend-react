import React, { memo, useEffect, useRef } from 'react';

import { Textarea } from '@digdir/designsystemet-react';
import dot from 'dot-object';
import { useStore } from 'zustand';

import { Flex } from 'src/app-components/Flex/Flex';
import { Input } from 'src/app-components/Input/Input';
import { Label } from 'src/app-components/Label/Label';
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
  // const allComps = getComponentConfigs();
  //
  // debugger;

  // @ts-ignore
  //const renderComponent = useStore(initialStateStore, (state) => state.componentConfigs[component.type]);

  const setDataValue = useStore(layoutStore, (state) => state.setDataValue);
  const binding =
    !parentBinding && component.dataModelBindings && component.dataModelBindings['simpleBinding']
      ? component.dataModelBindings['simpleBinding']
      : `${parentBinding}[${itemIndex}]${childField}`;

  const value = useStore(layoutStore, (state) => (binding ? dot.pick(binding, state.data) : undefined));

  const ref = useRef<HTMLDivElement>(null);

  const evaluateExpression = useStore(layoutStore, (state) => state.evaluateExpression);

  // useEffect(() => {
  //   if (!ref.current) {
  //     return;
  //   }
  //
  //   const node = ref.current;
  //   const observer = new IntersectionObserver(([entry]) => {
  //     if (entry.isIntersecting) {
  //       // Your code that should only run when this item is in view:
  //       console.log(`RenderComponent ${component.id} is now visible in the viewport`);
  //
  //       // If you only want to do this ONCE per component, unobserve here:
  //       observer.unobserve(node);
  //     }
  //   });
  //
  //   observer.observe(node);
  //   return () => {
  //     observer.disconnect();
  //   };
  // }, [component.id]);

  const depenentFields = Array.isArray(component.hidden) ? extractDataModelFields(component.hidden) : [];

  useEffect(() => {
    // if (component.type === 'TextArea') {
    //   console.log('component.isHidden');
    //   console.log(component.isHidden);
    // }

    if (Array.isArray(component.hidden)) {
      console.log('we have set tthis');
      console.log('component.isHidden');
      console.log(component.hidden);
      // @ts-ignore
      const isHidden = component.isHidden !== undefined ? evaluateExpression(component.hidden) : false;
      console.log('isHidden', isHidden);

      const fields = extractDataModelFields(component.hidden);
      console.log('fields', fields);
    }
  }, [component.isHidden, evaluateExpression]);

  const textResource = useStore(textResourceStore, (state) =>
    component.textResourceBindings && component.textResourceBindings['title'] && state.textResource?.resources
      ? // @ts-ignore
        state.textResource.resources.find((r) => r.id === component.textResourceBindings['title']) //dot.pick(component.textResourceBindings['title'], state.textResource)
      : undefined,
  );

  return (
    <div
      ref={ref}
      key={component.id}
    >
      {depenentFields.length > 0 && <pre>{JSON.stringify(depenentFields, null, 2)}</pre>}
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

      {component.type === 'Alert' && <div>Alert</div>}

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
