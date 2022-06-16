import React from 'react';
import {IComponentProps} from 'src/components';
import {AltinnButton} from 'altinn-shared/components';
import {getTextFromAppOrDefault} from "src/utils/textResource";
import {useAppSelector} from "src/common/hooks";


export const PrintButtonComponent = ({textResourceBindings, language}: IComponentProps) => {
  const textResources = useAppSelector(
    (state) => state.textResources.resources,
  );
  return (
    <AltinnButton btnText={getTextFromAppOrDefault(
      textResourceBindings.text || 'Print',
      textResources,
      language,
      null,
      true,
    )} secondaryButton onClickFunction={window.print}/>
  )
}
