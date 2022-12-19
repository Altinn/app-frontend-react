import React from 'react';

import { Grid, Typography } from '@material-ui/core';

import { useAppSelector } from 'src/common/hooks';
import { SummaryComponent } from 'src/components/summary/SummaryComponent';
import { ExprDefaultsForGroup } from 'src/features/expressions';
import { useExpressions } from 'src/features/expressions/useExpressions';
import { mapGroupComponents } from 'src/features/form/containers/formUtils';
import css from 'src/features/pdf/PDFView.module.css';
import { GenericComponent } from 'src/layout/GenericComponent';
import { makeGetHidden } from 'src/selectors/getLayoutData';
import { topLevelComponents } from 'src/utils/formLayout';
import { getTextFromAppOrDefault } from 'src/utils/textResource';
import type { ILayoutGroup } from 'src/layout/Group/types';
import type { ILayout, ILayoutComponentOrGroup } from 'src/layout/layout';

interface ICustomPDFLayout {
  pdfLayout: ILayout;
}

const presentationComponents = new Set(['Header', 'Paragraph', 'Image']);

const CustomPDFGroupComponent = ({ groupComponent, layout }: { groupComponent: ILayoutGroup; layout: ILayout }) => {
  const children = mapGroupComponents(groupComponent, layout);
  const textResourceBindings = useExpressions(groupComponent.textResourceBindings, {
    forComponentId: groupComponent.id,
    defaults: ExprDefaultsForGroup.textResourceBindings,
  });
  const GetHiddenSelector = makeGetHidden();
  const hidden: boolean = useAppSelector((state) => GetHiddenSelector(state, { id: groupComponent.id }));
  const title = useAppSelector((state) => {
    const titleKey = textResourceBindings?.title;
    if (titleKey && state.language.language) {
      return getTextFromAppOrDefault(titleKey, state.textResources.resources, state.language.language, [], true);
    }
    return undefined;
  });

  if (hidden) {
    return null;
  }

  return (
    <Grid
      container={true}
      item={true}
      id={groupComponent.id}
      spacing={3}
      alignItems='flex-start'
    >
      {title && (
        <Grid
          item={true}
          xs={12}
        >
          <Typography
            style={{ fontWeight: 700, fontSize: '2.4rem', paddingBottom: 12 }}
            variant='body1'
          >
            {title}
          </Typography>
        </Grid>
      )}
      {children.map((child) => (
        <CustomPDFSummaryComponent
          key={child.id}
          component={child}
          layout={layout}
        />
      ))}
    </Grid>
  );
};

const CustomPDFSummaryComponent = ({ component, layout }: { component: ILayoutComponentOrGroup; layout: ILayout }) => {
  if (component.type === 'Group') {
    return (
      <CustomPDFGroupComponent
        groupComponent={component}
        layout={layout}
      />
    );
  } else if (component.type === 'Summary') {
    return (
      <SummaryComponent
        {...component}
        display={{ hideChangeButton: true, hideValidationMessages: true }}
      />
    );
  } else if (presentationComponents.has(component.type)) {
    return <GenericComponent {...component} />;
  } else {
    console.warn(`Type: "${component.type}" is not allowed in PDF.`);
    return null;
  }
};

const CustomPDFLayout = ({ pdfLayout }: ICustomPDFLayout) => (
  <>
    {topLevelComponents(pdfLayout).map((comp) => (
      <div
        key={comp.id}
        className={css['component-container']}
      >
        <CustomPDFSummaryComponent
          component={comp}
          layout={pdfLayout}
        />
      </div>
    ))}
  </>
);
export default CustomPDFLayout;
