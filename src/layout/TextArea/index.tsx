import React from 'react';

import { FormComponent } from 'src/layout/LayoutComponent';
import { TextAreaComponent } from 'src/layout/TextArea/TextAreaComponent';
import type { PropsFromGenericComponent } from 'src/layout';

export class TextArea extends FormComponent<'TextArea'> {
  render(props: PropsFromGenericComponent<'TextArea'>): JSX.Element | null {
    return <TextAreaComponent {...props} />;
  }
}
