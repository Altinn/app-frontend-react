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
import { SubformDef } from 'src/layout/Subform/config.def.generated';
import { SubformComponent } from 'src/layout/Subform/SubformComponent';
import { SubformValidator } from 'src/layout/Subform/SubformValidator';
import {
  RedirectBackToMainForm,
  SubformFirstPage,
  SubformForm,
  SubformWrapper,
} from 'src/layout/Subform/SubformWrapper';
import { SubformSummaryComponent } from 'src/layout/Subform/Summary/SubformSummaryComponent';
import { SUMMARUSubformComponent } from 'src/layout/Subform/Summary/SubformSummaryComponent2';
import type { TextReference } from 'src/features/language/useLanguage';
import type { PropsFromGenericComponent, ValidateComponent } from 'src/layout';
import type { NodeValidationProps } from 'src/layout/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { Summary2Props } from 'src/layout/Summary2/SummaryComponent2/types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class Subform extends SubformDef implements ValidateComponent<'Subform'> {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'Subform'>>(
    function LayoutComponentSubformRender(props, _): JSX.Element | null {
      return <SubformComponent {...props} />;
    },
  );

  subRouting(node: LayoutNode<'Subform'>): JSX.Element | null {
    return (
      <TaskStoreProvider>
        <Routes>
          <Route
            path=':dataElementId/:subformPage'
            element={
              <SubformWrapper node={node}>
                <SubformForm />
              </SubformWrapper>
            }
          />
          <Route
            path=':dataElementId'
            element={
              <SubformWrapper node={node}>
                <SubformFirstPage />
              </SubformWrapper>
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

  renderLayoutValidators(props: NodeValidationProps<'Subform'>): JSX.Element | null {
    return <SubformValidator {...props} />;
  }

  renderSummaryBoilerplate(): boolean {
    return true;
  }

  renderSummary({ targetNode }: SummaryRendererProps<'Subform'>): JSX.Element | null {
    return <SubformSummaryComponent targetNode={targetNode} />;
  }

  renderSummary2(props: Summary2Props<'Subform'>) {
    // console.log(props);
    // return <div>renrdyer sum 2</div>;

    //<FormProvider>{children}</FormProvider>

    return <SUMMARUSubformComponent targetNode={props.target} />;

    // return (
    //   <TaskStoreProvider>
    //     <FormProvider>
    //       <SubformSummaryWrapper node={props.target}>
    //         {/*<ComponentStructureWrapper node={props.target}>*/}
    //         <SubformSummaryComponent2 targetNode={props.target} />
    //         {/*</ComponentStructureWrapper>*/}
    //       </SubformSummaryWrapper>
    //     </FormProvider>
    //   </TaskStoreProvider>
    // );
  }

  runComponentValidation(
    node: LayoutNode<'Subform'>,
    { applicationMetadata, instance, nodeDataSelector, layoutSets }: ValidationDataSources,
  ): ComponentValidation[] {
    const layoutSetName = nodeDataSelector((picker) => picker(node)?.layout.layoutSet, [node]);
    if (!layoutSetName) {
      throw new Error(`Layoutset not found for node with id ${node.id}.`);
    }
    const targetType = layoutSets.sets.find((set) => set.id === layoutSetName)?.dataType;
    if (!targetType) {
      throw new Error(`Data type not found for layout with name ${layoutSetName}`);
    }
    const dataTypeDefinition = applicationMetadata.dataTypes.find((x) => x.id === targetType);
    if (dataTypeDefinition === undefined) {
      return [];
    }

    let validationMessage: TextReference | null = null;
    const { minCount, maxCount } = dataTypeDefinition;
    const numDataElements = instance?.data.filter((x) => x.dataType === targetType).length ?? 0;
    if (minCount > 0 && numDataElements < minCount) {
      validationMessage = {
        key: 'form_filler.error_min_count_not_reached_subform',
        params: [minCount, targetType],
      };
    } else if (maxCount > 0 && numDataElements > maxCount) {
      validationMessage = {
        key: 'form_fillers.error_max_count_reached_subform_local',
        params: [targetType, maxCount],
      };
    }

    return validationMessage
      ? [
          {
            message: validationMessage,
            severity: 'error',
            source: FrontendValidationSource.Component,
            category: ValidationMask.Required,
          },
        ]
      : [];
  }
}
