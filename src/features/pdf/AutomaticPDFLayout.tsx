import React from 'react';

import { SummaryComponent } from 'src/components/summary/SummaryComponent';
import css from 'src/features/pdf/PDFView.module.css';
import { GenericComponent } from 'src/layout/GenericComponent';
import { topLevelComponents } from 'src/utils/formLayout';
import type { ILayoutComponent, ILayoutComponentOrGroup, ILayouts } from 'src/layout/layout';

const summaryComponents = new Set([
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

interface IAutomaticPDFLayout {
  layouts: ILayouts;
  excludePageFromPdf: Set<string>;
  excludeComponentFromPdf: Set<string>;
  pageOrder: string[];
  hiddenPages: Set<string>;
}

const AutomaticPDFLayout = ({
  layouts,
  excludePageFromPdf,
  excludeComponentFromPdf,
  pageOrder,
  hiddenPages,
}: IAutomaticPDFLayout) => {
  const layoutAndComponents: [string, ILayoutComponentOrGroup[]][] = Object.entries(layouts as ILayouts)
    .filter(([pageRef]) => !excludePageFromPdf.has(pageRef))
    .filter(([pageRef]) => !hiddenPages.has(pageRef))
    .filter(([pageRef]) => pageOrder.includes(pageRef))
    .sort(([pA], [pB]) => pageOrder.indexOf(pA) - pageOrder.indexOf(pB))
    .map(([pageRef, layout]: [string, ILayoutComponentOrGroup[]]) => [
      pageRef,
      topLevelComponents(layout).filter((c) => summaryComponents.has(c.type) && !excludeComponentFromPdf.has(c.id)),
    ]);

  return (
    <>
      {layoutAndComponents
        .flatMap(([pageRef, components]) => components.map((comp) => [pageRef, comp]))
        .map(([pageRef, comp]: [string, ILayoutComponentOrGroup]) => {
          if (presentationComponents.has(comp.type)) {
            const props = comp as ILayoutComponent;
            return (
              <div
                key={comp.id}
                className={css['component-container']}
              >
                <GenericComponent {...props} />
              </div>
            );
          } else {
            return (
              <div
                key={comp.id}
                className={css['component-container']}
              >
                <SummaryComponent
                  id={`__pdf__${comp.id}`}
                  componentRef={comp.id}
                  pageRef={pageRef}
                  display={{ hideChangeButton: true, hideValidationMessages: true }}
                />
              </div>
            );
          }
        })}
    </>
  );
};

export default AutomaticPDFLayout;
