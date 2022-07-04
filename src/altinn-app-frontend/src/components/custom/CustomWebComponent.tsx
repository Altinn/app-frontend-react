import { getTextResourceByKey } from 'altinn-shared/utils';
import * as React from 'react';
import { useAppSelector } from 'src/common/hooks';
import type { ITextResource, ITextResourceBindings } from 'src/types';
import type { ICustomComponentProps } from './CustomComponent';

export enum CustomSupportedFrameworks {
  WebComponent = 'web-component',
  React = 'react',
}

function CustomWebComponent({
  tagName,
  formData,
  componentValidations,
  textResourceBindings,
  dataModelBindings,
  language,
  handleDataChange,
  ...passThroughProps
}: ICustomComponentProps) {
  const Tag = tagName as any;
  const wcRef = React.useRef(null);
  const textResources = useAppSelector(
    (state) => state.textResources.resources,
  );

  React.useLayoutEffect(() => {
    const handleChange = (customEvent: CustomEvent) => {
      const { value, field } = customEvent.detail;
      handleDataChange(value, field);
    };
    const { current } = wcRef;
    current.addEventListener('dataChanged', handleChange);
    return () => {
      current.removeEventListener('dataChanged', handleChange);
    };
  }, [handleDataChange, wcRef]);

  React.useLayoutEffect(() => {
    const { current } = wcRef;
    current.texts = getTextsForComponent(
      textResourceBindings,
      textResources,
      false,
    );
    current.dataModelBindings = dataModelBindings;
    current.language = language;
  }, [wcRef, textResourceBindings, textResources, dataModelBindings, language]);

  React.useLayoutEffect(() => {
    const { current } = wcRef;
    current.formData = formData;
    current.componentValidations = componentValidations;
  }, [formData, componentValidations]);

  if (!Tag || !textResources) return null;

  const propsAsAttributes: any = {};
  Object.keys(passThroughProps).forEach((key) => {
    propsAsAttributes[key] = JSON.stringify(passThroughProps[key]);
  });

  return (
    <div>
      <Tag
        ref={wcRef}
        {...propsAsAttributes}
      />
    </div>
  );
}

function getTextsForComponent(
  textResourceBindings: ITextResourceBindings,
  textResources: ITextResource[],
  stringify = true,
) {
  const result: any = {};
  Object.keys(textResourceBindings).forEach((key) => {
    result[key] = getTextResourceByKey(
      textResourceBindings[key],
      textResources,
    );
  });

  if (stringify) {
    return JSON.stringify(result);
  }
  return result;
}

export default CustomWebComponent;
