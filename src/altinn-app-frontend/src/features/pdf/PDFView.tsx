import React from 'react';
import { shallowEqual } from 'react-redux';

import { Grid } from '@material-ui/core';

import { useAppSelector } from 'src/common/hooks';
import { GenericComponent } from 'src/components/GenericComponent';
import SummaryComponentSwitch from 'src/components/summary/SummaryComponentSwitch';
import { useExpressionsForComponent } from 'src/features/expressions/useExpressions';
import css from 'src/features/pdf/PDFView.module.css';
import { ReadyForPrint } from 'src/shared/components/ReadyForPrint';
import { getDisplayFormDataForComponent } from 'src/utils/formComponentUtils';
import { topLevelComponents } from 'src/utils/formLayout';
import { getTextFromAppOrDefault } from 'src/utils/textResource';
import type { ILayoutComponent, ILayoutComponentOrGroup, ILayouts } from 'src/features/form/layout';

interface PDFViewProps {
  appName: string;
}

const componentTypesToRender = new Set([
  'AddressComponent',
  'AttachmentList',
  'Checkboxes',
  'Custom',
  'DatePicker',
  'Dropdown',
  'FileUpload',
  'FileUploadWithTag',
  'Group',
  'Header',
  'Image',
  'Input',
  'Map',
  'MultipleSelect',
  'Paragraph',
  'RadioButtons',
  'TextArea',
]);

const presentationComponents = new Set(['Header', 'Paragraph', 'Image']);

const PDFView = ({ appName }: PDFViewProps) => {
  const layouts = useAppSelector((state) => state.formLayout.layouts);
  const attachments = useAppSelector((state) => state.attachments.attachments);

  const layoutAndComponents: [string, ILayoutComponentOrGroup[]][] = Object.entries(layouts as ILayouts).map(
    ([pageRef, layout]: [string, ILayoutComponentOrGroup[]]) => [
      pageRef,
      topLevelComponents(layout).filter((c) => componentTypesToRender.has(c.type)),
    ],
  );

  const SummaryForPDF = ({ comp, pageRef }: { comp: ILayoutComponentOrGroup; pageRef: string }) => {
    const formComponent = useExpressionsForComponent(comp);
    const label = useAppSelector((state) => {
      const titleKey = formComponent?.textResourceBindings?.title;
      if (titleKey) {
        return (
          state.language.language &&
          getTextFromAppOrDefault(titleKey, state.textResources.resources, state.language.language, [], false)
        );
      }
      return undefined;
    });

    const formData = useAppSelector((state) => {
      if (formComponent?.type === 'Group') {
        return undefined;
      }
      if (
        (formComponent?.type === 'FileUpload' || formComponent?.type === 'FileUploadWithTag') &&
        Object.keys(formComponent.dataModelBindings || {}).length === 0
      ) {
        return undefined;
      }
      return getDisplayFormDataForComponent(
        state.formData.formData,
        attachments,
        formComponent as ILayoutComponent,
        state.textResources.resources,
        state.optionState.options,
        state.formLayout.uiConfig.repeatingGroups,
        true,
      );
    }, shallowEqual);

    return (
      <SummaryComponentSwitch
        id={comp.id}
        change={{
          onChangeClick: () => {
            // Empty on purpose
          },
          changeText: null,
        }}
        hasValidationMessages={false}
        formComponent={formComponent}
        label={label}
        formData={formData}
        componentRef={comp.id}
        pageRef={pageRef}
        groupProps={{ pageRef }}
        display={{ hideChangeButton: true, hideValidationMessages: true }}
      />
    );
  };

  return (
    <div className={css['pdf-wrapper']}>
      <h1>{appName}</h1>
      <Grid
        container
        spacing={2}
      >
        {layoutAndComponents
          .flatMap(([pageRef, components]) => components.map((comp) => [pageRef, comp]))
          .map(([pageRef, comp]: [string, ILayoutComponentOrGroup]) => {
            if (presentationComponents.has(comp.type)) {
              const props = comp as ILayoutComponent;
              return (
                <GenericComponent
                  key={comp.id}
                  {...props}
                />
              );
            } else {
              return (
                <SummaryForPDF
                  key={comp.id}
                  comp={comp}
                  pageRef={pageRef}
                />
              );
            }
          })}
      </Grid>
      <ReadyForPrint />
    </div>
  );
};

export default PDFView;
