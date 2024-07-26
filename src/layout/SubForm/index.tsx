import React, { forwardRef } from 'react';
import { Route, Routes } from 'react-router-dom';
import type { JSX } from 'react';

import {
  type ComponentValidation,
  FrontendValidationSource,
  type ValidationDataSources,
  ValidationMask,
} from 'src/features/validation';
import { SubFormDef } from 'src/layout/SubForm/config.def.generated';
import { SubFormComponent } from 'src/layout/SubForm/SubFormComponent';
import {
  RedirectBackToMainForm,
  SubFormFirstPage,
  SubFormForm,
  SubFormWrapper,
} from 'src/layout/SubForm/SubFormWrapper';
import { TaskIdStoreProvider } from 'src/layout/Summary2/taskIdStore';
import type { TextReference } from 'src/features/language/useLanguage';
import type { PropsFromGenericComponent, ValidateComponent } from 'src/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class SubForm extends SubFormDef implements ValidateComponent {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'SubForm'>>(
    function LayoutComponentSubformRender(props, _): JSX.Element | null {
      return <SubFormComponent {...props} />;
    },
  );

  subRouting(node: LayoutNode<'SubForm'>): JSX.Element | null {
    return (
      <TaskIdStoreProvider>
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
      </TaskIdStoreProvider>
    );
  }

  runComponentValidation(
    node: LayoutNode<'SubForm'>,
    { applicationMetadata, instance }: ValidationDataSources,
  ): ComponentValidation[] {
    const targetType = node.item.dataType;
    const dataTypeDefinition = applicationMetadata.dataTypes.find((x) => x.id === targetType);
    if (dataTypeDefinition === undefined) {
      return [];
    }

    let valiationMessage: TextReference | null = null;
    const { minCount, maxCount } = dataTypeDefinition;
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

    return valiationMessage
      ? [
          {
            message: valiationMessage,
            severity: 'error',
            source: FrontendValidationSource.Component,
            componentId: node.item.id,
            category: ValidationMask.Required,
          },
        ]
      : [];
  }
}
