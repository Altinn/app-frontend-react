import React from 'react';

import { LegacyTextArea } from '@digdir/design-system-react';

import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { useLanguage } from 'src/features/language/useLanguage';
import { useIsValid } from 'src/features/validation/selectors/isValid';
import { useCharacterLimit } from 'src/utils/inputUtils';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';

import 'src/styles/shared.css';

export type ITextAreaProps = PropsFromGenericComponent<'TextArea'>;

export function TextAreaComponent({ node, overrideDisplay }: ITextAreaProps) {
  const { langAsString } = useLanguage();
  const isValid = useIsValid(node);
  const { id, readOnly, textResourceBindings, dataModelBindings, saveWhileTyping, autocomplete, maxLength } =
    useNodeItem(node);
  const characterLimit = useCharacterLimit(maxLength);
  const {
    formData: { simpleBinding: value },
    setValue,
    debounce,
  } = useDataModelBindings(dataModelBindings, saveWhileTyping);

  return (
    <LegacyTextArea
      id={id}
      onChange={(e) => setValue('simpleBinding', e.target.value)}
      onBlur={debounce}
      readOnly={readOnly}
      resize='vertical'
      characterLimit={!readOnly ? characterLimit : undefined}
      isValid={isValid}
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
