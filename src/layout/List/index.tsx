import React from 'react';

import { staticUseLanguageFromState } from 'src/hooks/useLanguage';
import { FormComponent } from 'src/layout/LayoutComponent';
import { ListComponent } from 'src/layout/List/ListComponent';
import { SummaryItemSimple } from 'src/layout/Summary/SummaryItemSimple';
import { getFieldName } from 'src/utils/formComponentUtils';
import { buildValidationObject } from 'src/utils/validation/validationHelpers';
import type { ExprResolved } from 'src/features/expressions/types';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { ILayoutCompList } from 'src/layout/List/types';
import type { IRuntimeState } from 'src/types';
import type { LayoutNodeFromType } from 'src/utils/layout/hierarchy.types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { IValidationObject } from 'src/utils/validation/types';

export class List extends FormComponent<'List'> {
  render(props: PropsFromGenericComponent<'List'>): JSX.Element | null {
    return <ListComponent {...props} />;
  }

  renderWithLabel(): boolean {
    return false;
  }

  useDisplayData(node: LayoutNodeFromType<'List'>): string {
    const formData = node.getFormData();
    const dmBindings = node.item.dataModelBindings;
    for (const [key, binding] of Object.entries(dmBindings || {})) {
      if (binding == node.item.bindingToShowInSummary) {
        return formData[key] || '';
      }
    }

    return '';
  }

  renderSummary({ targetNode }: SummaryRendererProps<'List'>): JSX.Element | null {
    const displayData = this.useDisplayData(targetNode);
    return <SummaryItemSimple formDataAsString={displayData} />;
  }

  canRenderInTable(): boolean {
    return false;
  }

  runEmptyFieldValidation(node: LayoutNodeFromType<'List'>): IValidationObject[] {
    if (node.isHidden() || !node.item.required) {
      return [];
    }

    const state: IRuntimeState = window.reduxStore.getState();

    const langTools = staticUseLanguageFromState(state);
    const formData = node.getFormData();
    const validationObjects: IValidationObject[] = [];

    const bindingKeys = Object.keys(formData);
    let listHasErrors = false;
    for (const bindingKey of bindingKeys) {
      const data = formData[bindingKey];

      if (!data?.length) {
        listHasErrors = true;
      }
    }
    if (listHasErrors) {
      const fieldName = getFieldName(node.item.textResourceBindings, langTools, undefined);
      const message = langTools.langAsString('form_filler.error_required', [fieldName]);
      validationObjects.push(buildValidationObject(node, 'errors', message));
    }
    return validationObjects;
  }
}

export const Config = {
  def: new List(),
};

export type TypeConfig = {
  layout: ILayoutCompList;
  nodeItem: ExprResolved<ILayoutCompList>;
  nodeObj: LayoutNode;
};
