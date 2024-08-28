import React, { forwardRef } from 'react';
import { Route, Routes } from 'react-router-dom';
import type { JSX } from 'react';

import { TaskStoreProvider } from 'src/core/contexts/taskStoreContext';
import {
  type ComponentValidation,
  FrontendValidationSource,
  type ValidationDataSources,
  ValidationMask,
} from 'src/features/validation';
import { SubFormDef } from 'src/layout/SubForm/config.def.generated';
import { SubFormComponent } from 'src/layout/SubForm/SubFormComponent';
import { SubFormValidator } from 'src/layout/SubForm/SubFormValidator';
import {
  RedirectBackToMainForm,
  SubFormFirstPage,
  SubFormForm,
  SubFormWrapper,
} from 'src/layout/SubForm/SubFormWrapper';
import { SubFormSummaryComponent } from 'src/layout/SubForm/Summary/SubFormSummaryComponent';
import { SubFormSummaryComponent2 } from 'src/layout/SubForm/Summary/SubFormSummaryComponent2';
import type { TextReference } from 'src/features/language/useLanguage';
import type { PropsFromGenericComponent, ValidateComponent } from 'src/layout';
import type { NodeValidationProps } from 'src/layout/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { Summary2Props } from 'src/layout/Summary2/SummaryComponent2/types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class SubForm extends SubFormDef implements ValidateComponent<'SubForm'> {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'SubForm'>>(
    function LayoutComponentSubformRender(props, _): JSX.Element | null {
      return <SubFormComponent {...props} />;
    },
  );

  subRouting(node: LayoutNode<'SubForm'>): JSX.Element | null {
    return (
      <TaskStoreProvider>
        <Routes>
          <Route
            path=':dataElementId/:subFormPage'
            element={
              <SubFormWrapper node={node}>
                <SubFormForm />
              </SubFormWrapper>
            }
          />
          <Route
            path=':dataElementId'
            element={
              <SubFormWrapper node={node}>
                <SubFormFirstPage />
              </SubFormWrapper>
            }
          />
          <Route
            path='*'
            element={<RedirectBackToMainForm />}
          />
        </Routes>
      </TaskStoreProvider>
    );
  }

  renderLayoutValidators(props: NodeValidationProps<'SubForm'>): JSX.Element | null {
    return <SubFormValidator {...props} />;
  }

  renderSummaryBoilerplate(): boolean {
    return true;
  }

  renderSummary({ targetNode }: SummaryRendererProps<'SubForm'>): JSX.Element | null {
    return <SubFormSummaryComponent targetNode={targetNode} />;
  }

  renderSummary2(props: Summary2Props<'SubForm'>): JSX.Element | null {
    return <SubFormSummaryComponent2 targetNode={props.target} />;
  }

  runComponentValidation(
    node: LayoutNode<'SubForm'>,
    { applicationMetadata, instance, nodeDataSelector }: ValidationDataSources,
  ): ComponentValidation[] {
    const targetType = nodeDataSelector((picker) => picker(node)?.layout.dataType, [node]);
    const dataTypeDefinition = applicationMetadata.dataTypes.find((x) => x.id === targetType);
    if (dataTypeDefinition === undefined) {
      return [];
    }

    let valiationMessage: TextReference | null = null;
    const { minCount, maxCount, appLogic } = dataTypeDefinition;
    const numDataElements = instance?.data.filter((x) => x.dataType === targetType).length ?? 0;
    if (minCount > 0 && numDataElements < minCount) {
      valiationMessage = {
        key: 'form_filler.error_min_count_not_reached_sub_form',
        params: [minCount, targetType],
      };
    } else if (maxCount > 0 && numDataElements > maxCount) {
      valiationMessage = {
        key: 'form_fillers.error_max_count_reached_sub_form_local',
        params: [targetType, maxCount],
      };
    }

    const allowInSubform = appLogic?.allowInSubform;
    if (allowInSubform === undefined || allowInSubform === null || !allowInSubform) {
      valiationMessage = {
        key: 'form_filler.error_data_type_not_allowed_in_sub_form',
        params: [targetType],
      };
    }

    return valiationMessage
      ? [
          {
            message: valiationMessage,
            severity: 'error',
            source: FrontendValidationSource.Component,
            category: ValidationMask.Required,
          },
        ]
      : [];
  }
}
