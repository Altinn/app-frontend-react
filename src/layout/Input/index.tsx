import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import { formatNumericText } from '@digdir/design-system-react';

import { FrontendValidationSource } from 'src/features/validation';
import { getMapToReactNumberConfig } from 'src/hooks/useMapToReactNumberConfig';
import { InputDef } from 'src/layout/Input/config.def.generated';
import { InputComponent } from 'src/layout/Input/InputComponent';
import { SummaryItemSimple } from 'src/layout/Summary/SummaryItemSimple';
import type { LayoutValidationCtx } from 'src/features/devtools/layoutValidation/types';
import type { BaseValidation } from 'src/features/validation';
import type {
  DisplayDataProps,
  PropsFromGenericComponent,
  ValidationFilter,
  ValidationFilterFunction,
} from 'src/layout';
import type { IInputFormatting } from 'src/layout/Input/config.generated';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class Input extends InputDef implements ValidationFilter {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'Input'>>(
    function LayoutComponentInputRender(props, _): JSX.Element | null {
      return <InputComponent {...props} />;
    },
  );

  getDisplayData(node: LayoutNode<'Input'>, { currentLanguage }: DisplayDataProps): string {
    if (!node.item.dataModelBindings?.simpleBinding) {
      return '';
    }

    const text = node.getFormData().simpleBinding || '';
    const numberFormatting = getMapToReactNumberConfig(
      node.item.formatting as IInputFormatting | undefined,
      text,
      currentLanguage,
    );

    if (numberFormatting?.number) {
      return formatNumericText(text, numberFormatting.number);
    }

    return text;
  }

  renderSummary({ targetNode }: SummaryRendererProps<'Input'>): JSX.Element | null {
    const displayData = this.useDisplayData(targetNode);
    return <SummaryItemSimple formDataAsString={displayData} />;
  }

  /**
   * Input has a custom maxLength constraint which give a better error message than what the schema provides.
   * Filter out the schema maxLength vaildation to avoid duplicate error messages.
   */
  maxLengthFilter(validation: BaseValidation): boolean {
    return !(
      validation.source === FrontendValidationSource.Schema && validation.message.key === 'validation_errors.maxLength'
    );
  }

  getValidationFilter(node: LayoutNode<'Input'>): ValidationFilterFunction | null {
    const maxLength = node.item.maxLength;
    if (typeof maxLength === 'undefined') {
      return null;
    }
    return this.maxLengthFilter;
  }

  validateDataModelBindings(ctx: LayoutValidationCtx<'Input'>): string[] {
    return this.validateDataModelBindingsSimple(ctx);
  }
}
