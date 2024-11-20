import React from 'react';

import { HelpText, Textarea } from '@digdir/designsystemet-react';
import { Grid } from '@material-ui/core';

import { Label } from 'src/app-components/Label/Label';
import { Description } from 'src/components/form/Description';
import { OptionalIndicator } from 'src/components/form/OptionalIndicator';
import { RequiredIndicator } from 'src/components/form/RequiredIndicator';
import { getDescriptionId } from 'src/components/label/Label';
import { FD } from 'src/features/formData/FormDataWrite';
import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { useIsValid } from 'src/features/validation/selectors/isValid';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import { gridBreakpoints } from 'src/utils/formComponentUtils';
import { useCharacterLimit } from 'src/utils/inputUtils';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';

import 'src/styles/shared.css';

export type ITextAreaProps = Readonly<PropsFromGenericComponent<'TextArea'>>;

export function TextAreaComponent({ node, overrideDisplay }: ITextAreaProps) {
  const { langAsString } = useLanguage();
  const isValid = useIsValid(node);
  const {
    id,
    readOnly,
    textResourceBindings,
    dataModelBindings,
    saveWhileTyping,
    autocomplete,
    maxLength,
    grid,
    required,
    labelSettings,
  } = useNodeItem(node);
  const characterLimit = useCharacterLimit(maxLength);
  const {
    formData: { simpleBinding: value },
    setValue,
  } = useDataModelBindings(dataModelBindings, saveWhileTyping);
  const debounce = FD.useDebounceImmediately();

  return (
    <>
      <Grid
        item
        {...gridBreakpoints(grid?.labelGrid)}
      >
        <Label
          htmlFor={id}
          label={langAsString(textResourceBindings?.title)}
          required={required}
          requiredIndicator={<RequiredIndicator required={required} />}
          optionalIndicator={
            <OptionalIndicator
              optional={!required && !!labelSettings?.optionalIndicator}
              readOnly={readOnly}
            />
          }
          help={
            textResourceBindings?.help ? (
              <HelpText
                id={`${id}-helptext`}
                title={`${langAsString('helptext.button_title_prefix')} ${langAsString(textResourceBindings?.title)}`}
              >
                <Lang id={textResourceBindings?.help} />
              </HelpText>
            ) : undefined
          }
        />
        {textResourceBindings?.description && <Description description={textResourceBindings?.description} />}
      </Grid>
      <ComponentStructureWrapper node={node}>
        <Textarea
          id={id}
          onChange={(e) => setValue('simpleBinding', e.target.value)}
          onBlur={debounce}
          readOnly={readOnly}
          characterLimit={!readOnly ? characterLimit : undefined}
          error={!isValid}
          value={value}
          data-testid={id}
          aria-describedby={
            overrideDisplay?.renderedInTable !== true && textResourceBindings?.description
              ? getDescriptionId(id)
              : undefined
          }
          aria-label={overrideDisplay?.renderedInTable === true ? langAsString(textResourceBindings?.title) : undefined}
          autoComplete={autocomplete}
          style={{ height: '150px' }}
        />
      </ComponentStructureWrapper>
    </>
  );
}
