import React from 'react';

import { useAppSelector } from 'src/common/hooks';
import { SubmitButton } from 'src/components/base/ButtonComponent';
import { getTextFromAppOrDefault } from 'src/utils/textResource';
import type { buttonLoaderProps } from 'src/components/base/ButtonComponent/ButtonLoader';
import type { baseButtonProps } from 'src/components/base/ButtonComponent/WrappedButton';

export const ConfirmButton = (
  props: baseButtonProps & buttonLoaderProps & { id: string },
) => {
  const textResources = useAppSelector(
    (state) => state.textResources.resources,
  );
  return (
    <SubmitButton {...props}>
      {getTextFromAppOrDefault(
        'confirm.button_text',
        textResources,
        props.language,
      )}
    </SubmitButton>
  );
};
