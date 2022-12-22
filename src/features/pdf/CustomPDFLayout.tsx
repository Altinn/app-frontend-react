import React from 'react';

import { SummaryComponent } from 'src/components/summary/SummaryComponent';
import { DisplayGroupContainer } from 'src/features/form/containers/DisplayGroupContainer';
import { mapGroupComponents } from 'src/features/form/containers/formUtils';
import PDFComponentWrapper from 'src/features/pdf/PDFComponentWrapper';
import { GenericComponent } from 'src/layout/GenericComponent';
import { topLevelComponents } from 'src/utils/formLayout';
import type { ContextDataSources } from 'src/features/expressions/ExprContext';
import type { ILayout, ILayoutComponentOrGroup } from 'src/layout/layout';
import type { LayoutRootNode, LayoutRootNodeCollection } from 'src/utils/layout/hierarchy';

interface ICustomPDFLayout {
  layout: ILayout;
  nodes:
    | LayoutRootNode<'unresolved'>
    | LayoutRootNodeCollection<
        'unresolved',
        {
          [layoutKey: string]: LayoutRootNode<'unresolved'>;
        }
      >;
  dataSources: ContextDataSources;
}

const presentationComponents = new Set(['Header', 'Paragraph', 'Image', 'Panel']);

const CustomPDFSummaryComponent = ({ component, layout }: { component: ILayoutComponentOrGroup; layout: ILayout }) => {
  if (component.type === 'Group') {
    return (
      <DisplayGroupContainer
        container={component}
        components={mapGroupComponents(component, layout)}
        renderLayoutComponent={(child) => (
          <CustomPDFSummaryComponent
            key={child.id}
            component={child}
            layout={layout}
          />
        )}
      />
    );
  } else if (component.type === 'Summary') {
    return (
      <SummaryComponent
        {...component}
        display={{ hideChangeButton: true, hideValidationMessages: true }}
        grid={{ xs: 12 }}
      />
    );
  } else if (presentationComponents.has(component.type)) {
    return (
      <GenericComponent
        {...component}
        grid={{ xs: 12 }}
      />
    );
  } else {
    console.warn(`Type: "${component.type}" is not allowed in PDF.`);
    return null;
  }
};

const CustomPDFLayout = ({ layout, nodes, dataSources }: ICustomPDFLayout) => (
  <>
    {topLevelComponents(layout).map((component) => (
      <PDFComponentWrapper
        key={component.id}
        component={component}
        nodes={nodes}
        dataSources={dataSources}
      >
        <CustomPDFSummaryComponent
          component={component}
          layout={layout}
        />
      </PDFComponentWrapper>
    ))}
  </>
);
export default CustomPDFLayout;
