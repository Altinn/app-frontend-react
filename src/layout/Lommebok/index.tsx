import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import { LommebokDef } from 'src/layout/Lommebok/config.def.generated';
import { LommebokComponent } from 'src/layout/Lommebok/LommebokComponent';
import { LommebokValidator } from 'src/layout/Lommebok/LommebokValidator';
import { useValidateLommebok } from 'src/layout/Lommebok/useValidateLommebok';
import type { ComponentValidation } from 'src/features/validation';
import type { PropsFromGenericComponent, ValidateComponent } from 'src/layout';
import type { NodeValidationProps } from 'src/layout/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { Summary2Props } from 'src/layout/Summary2/SummaryComponent2/types';

export class Lommebok extends LommebokDef implements ValidateComponent {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'Lommebok'>>(
    function LayoutComponentInputRender(props, _): JSX.Element | null {
      return <LommebokComponent {...props} />;
    },
  );

  renderSummary(_props: SummaryRendererProps): JSX.Element | null {
    return <h2>Not implemented</h2>;
  }

  renderSummary2(_props: Summary2Props): JSX.Element | null {
    return <h2>Not implemented</h2>;
  }

  useComponentValidation(baseComponentId: string): ComponentValidation[] {
    return useValidateLommebok(baseComponentId);
  }

  renderLayoutValidators(props: NodeValidationProps<'Lommebok'>): JSX.Element | null {
    return <LommebokValidator {...props} />;
  }
}
