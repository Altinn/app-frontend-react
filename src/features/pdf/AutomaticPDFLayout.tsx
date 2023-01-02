import React from 'react';

import { SummaryComponent } from 'src/components/summary/SummaryComponent';
import css from 'src/features/pdf/PDFView.module.css';
import { GenericComponent } from 'src/layout/GenericComponent';
import { topLevelComponents } from 'src/utils/formLayout';
import type { ILayoutCompInstanceInformation } from 'src/layout/InstanceInformation/types';
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
  'Input',
  'List',
  'Map',
  'MultipleSelect',
  'RadioButtons',
  'TextArea',
]);

const presentationComponents = new Set(['Header', 'Paragraph', 'Image', 'Panel']);

const renderComponents = new Set([...summaryComponents, ...presentationComponents]);

interface IAutomaticPDFLayout {
  layouts: ILayouts;
  excludePageFromPdf: Set<string>;
  excludeComponentFromPdf: Set<string>;
  pageOrder: string[];
  hiddenPages: Set<string>;
}

const AutomaticPDFSummaryComponent = ({
  component,
  pageRef,
  excludedChildren,
}: {
  component: ILayoutComponentOrGroup;
  pageRef: string;
  excludedChildren: string[];
}) => {
  if (summaryComponents.has(component.type)) {
    return (
      <SummaryComponent
        id={`__pdf__${component.id}`}
        componentRef={component.id}
        pageRef={pageRef}
        display={{ hideChangeButton: true, hideValidationMessages: true }}
        excludedChildren={excludedChildren}
        grid={{ xs: 12 }}
      />
    );
  } else if (presentationComponents.has(component.type)) {
    return (
      <GenericComponent
        {...(component as ILayoutComponent)}
        grid={{ xs: 12 }}
      />
    );
  } else {
    return null;
  }
};

const AutomaticPDFLayout = ({
  layouts,
  excludePageFromPdf,
  excludeComponentFromPdf,
  pageOrder,
  hiddenPages,
}: IAutomaticPDFLayout) => {
  const layoutAndComponents = Object.entries(layouts as ILayouts)
    .filter(([pageRef]) => !excludePageFromPdf.has(pageRef))
    .filter(([pageRef]) => !hiddenPages.has(pageRef))
    .filter(([pageRef]) => pageOrder.includes(pageRef))
    .sort(([pA], [pB]) => pageOrder.indexOf(pA) - pageOrder.indexOf(pB))
    .map(([pageRef, layout]: [string, ILayoutComponentOrGroup[]]) => [
      pageRef,
      topLevelComponents(layout).filter((c) => renderComponents.has(c.type) && !excludeComponentFromPdf.has(c.id)),
    ])
    .flatMap(([pageRef, components]: [string, ILayoutComponentOrGroup[]]) => components.map((comp) => [pageRef, comp]));

  const instanceInformationProps: ILayoutCompInstanceInformation = {
    id: '__pdf__instance-information',
    type: 'InstanceInformation',
    elements: {
      dateSent: true,
      sender: true,
      receiver: true,
      referenceNumber: true,
    },
    pageBreak: {
      breakAfter: true,
    },
  };

  return (
    <>
      <div className={css['component-container']}>
        <GenericComponent {...instanceInformationProps} />
      </div>
      {layoutAndComponents.map(([pageRef, component]: [string, ILayoutComponentOrGroup]) => (
        <div
          key={component.id}
          className={css['component-container']}
        >
          <AutomaticPDFSummaryComponent
            component={component}
            pageRef={pageRef}
            excludedChildren={Array.from(excludeComponentFromPdf)}
          />
        </div>
      ))}
    </>
  );
};

export default AutomaticPDFLayout;
