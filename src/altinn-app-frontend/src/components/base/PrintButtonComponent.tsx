import React from 'react';
import { IComponentProps } from 'src/components';
import { AltinnButton } from 'altinn-shared/components';
import { getTextFromAppOrDefault } from 'src/utils/textResource';
import { useAppSelector } from 'src/common/hooks';
import { getLanguageFromKey } from 'altinn-shared/utils';

export const PrintButtonComponent = ({
  textResourceBindings,
  language,
}: Partial<IComponentProps>) => {
  const textResources = useAppSelector(
    (state) => state.textResources.resources,
  );

  return (
    <AltinnButton
      btnText={getTextFromAppOrDefault(
        textResourceBindings?.text ||
          getLanguageFromKey('general.print_button', language),
        textResources,
        language,
        null,
        true,
      )}
      secondaryButton
      onClickFunction={window.print}
    />
  );
};
