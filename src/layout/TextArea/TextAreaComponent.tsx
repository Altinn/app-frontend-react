import React from 'react';

import { Textarea } from '@digdir/designsystemet-react';

import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { useLanguage } from 'src/features/language/useLanguage';
import { LabelContent } from 'src/layout/LabelContent';
import { useCharacterLimit } from 'src/utils/inputUtils';
import type { PropsFromGenericComponent } from 'src/layout';

import 'src/styles/shared.css';

export type ITextAreaProps = PropsFromGenericComponent<'TextArea'>;

export function TextAreaComponent({ node, overrideDisplay, isValid }: ITextAreaProps) {
  const { langAsString } = useLanguage();
  const {
    id,
    readOnly,
    textResourceBindings,
    dataModelBindings,
    saveWhileTyping,
    autocomplete,
    maxLength,
    required,
    labelSettings,
  } = node.item;
  const characterLimit = useCharacterLimit(maxLength);
  const {
    formData: { simpleBinding: value },
    setValue,
    debounce,
  } = useDataModelBindings(dataModelBindings, saveWhileTyping);

  return (
    <Textarea
      id={id}
      label={
        <LabelContent
          label={textResourceBindings?.title}
          description={textResourceBindings?.description}
          helpText={textResourceBindings?.help}
          readOnly={readOnly}
          labelSettings={labelSettings}
          required={required}
        />
      }
      onChange={(e) => setValue('simpleBinding', e.target.value)}
      onBlur={debounce}
      readOnly={readOnly}
      characterLimit={!readOnly ? characterLimit : undefined}
      error={!isValid}
      value={value}
      data-testid={id}
      aria-describedby={
        overrideDisplay?.renderedInTable !== true && textResourceBindings?.description ? `description-${id}` : undefined
      }
      aria-label={overrideDisplay?.renderedInTable === true ? langAsString(textResourceBindings?.title) : undefined}
      autoComplete={autocomplete}
      style={{ height: '150px' }}
    />
  );
}
