import React, { memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { Alert, Checkbox, Radio, Textarea } from '@digdir/designsystemet-react';
import dot from 'dot-object';
import { useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

import { Flex } from 'src/app-components/Flex/Flex';
import { Input } from 'src/app-components/Input/Input';
import { Label } from 'src/app-components/Label/Label';
import classes from 'src/layout/GenericComponent.module.css';
import { useValidateComponent } from 'src/next/app/hooks/useValidateComponent';
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

export const RenderComponent = memo(function RenderComponent({
  component,
  parentBinding,
  itemIndex,
  childField,
}: RenderComponentType) {
  const setDataValue = useStore(layoutStore, (state) => state.setDataValue);

  const navigate = useNavigate();

  const binding = useMemo(() => {
    // @ts-ignore
    const simple = component.dataModelBindings?.simpleBinding;
    if (!simple) {
      return undefined;
    }
    if (!parentBinding) {
      return simple;
    }
    return `${parentBinding}[${itemIndex}]${childField || ''}`;
  }, [component.dataModelBindings, parentBinding, itemIndex, childField]);

  const value = useStore(
    layoutStore,
    useShallow((state) => (binding ? dot.pick(binding, state.data) : undefined)),
  );

  const validationErrors = useValidateComponent(component, value);

  const isHidden = useStore(layoutStore, (state) => {
    if (!component.hidden) {
      return false;
    }
    // @ts-ignore
    return state.evaluateExpression(component.hidden, parentBinding, itemIndex);
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

  return (
    <div key={component.id}>
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
            {/*<Label label={textResource?.value || ''} />*/}
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

      {/*{component.type === 'Alert' && <div>{textResource?.value}</div>}*/}

      {component.type === 'RadioButtons' && (
        <div>
          <Radio.Group
            legend=''
            role='radiogroup'
          >
            {component.options?.map((option, idx) => (
              <Radio
                value={`${option.value}`}
                description={option.description}
                key={idx}
                onChange={(event) => {
                  setDataValue(binding, event.target.value);
                }}
              >
                {option.label}
              </Radio>
            ))}
          </Radio.Group>
        </div>
      )}

      {component.type === 'Checkboxes' && (
        <div>
          <Checkbox.Group
            legend=''
            role='radiogroup'
          >
            {component.options?.map((option, idx) => (
              <Checkbox
                key={idx}
                description={option.description}
                value={`${option.value}`}
                size='small'
                onChange={(event) => {
                  console.log('event.target.value', event.target.value);
                  setDataValue(binding, event.target.value);
                }}
              >
                <span>
                  {option.label}
                  {option.value}
                </span>
              </Checkbox>
            ))}
          </Checkbox.Group>
        </div>
      )}

      {component.type === 'Alert' && <Alert>You are using the Alert component!</Alert>}

      {component.type === 'CustomButton' && component.actions[0].type === 'ClientAction' && (
        <button
          onClick={() => {
            if (component.actions[0].type === 'ClientAction') {
              // @ts-ignore
              navigate(component.actions[0].metadata.page);
            }
          }}
        />
      )}

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
