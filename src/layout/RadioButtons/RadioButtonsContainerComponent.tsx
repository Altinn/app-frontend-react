import React from 'react';

import { ControlledRadioGroup } from 'src/layout/RadioButtons/ControlledRadioGroup';
import type { PropsFromGenericComponent } from 'src/layout';

export type IRadioButtonsContainerProps = PropsFromGenericComponent<'RadioButtons'>;

export const RadioButtonContainerComponent = (props: IRadioButtonsContainerProps) => (
  <ControlledRadioGroup {...props} />
);
