import React from 'react';

import Grid from '@material-ui/core/Grid';

import { useAppSelector } from 'src/common/hooks';
import ErrorReport from 'src/components/message/ErrorReport';
import { SummaryComponent } from 'src/components/summary/SummaryComponent';
import MessageBanner from 'src/features/form/components/MessageBanner';
import { DisplayGroupContainer } from 'src/features/form/containers/DisplayGroupContainer';
import { GroupContainer } from 'src/features/form/containers/GroupContainer';
import { PanelGroupContainer } from 'src/features/form/containers/PanelGroupContainer';
import {
  extractBottomButtons,
  hasRequiredFields,
  topLevelComponents,
} from 'src/utils/formLayout';
import { renderGenericComponent } from 'src/utils/layout';
import {
  getFormHasErrors,
  missingFieldsInLayoutValidations,
} from 'src/utils/validation';
import type {
  ILayout,
  ILayoutComponent,
  ILayoutGroup,
} from 'src/features/form/layout';

export function renderLayoutComponent(
  layoutComponent: ILayoutComponent | ILayoutGroup,
  layout: ILayout,
) {
  switch (layoutComponent.type) {
    case 'Group': {
      return RenderLayoutGroup(layoutComponent, layout);
    }
    case 'Summary': {
      return (
        <SummaryComponent
          key={layoutComponent.id}
          {...layoutComponent}
        />
      );
    }
    default: {
      return (
        <RenderGenericComponent
          key={layoutComponent.id}
          {...layoutComponent}
        />
      );
    }
  }
}

function RenderGenericComponent(component: ILayoutComponent, layout: ILayout) {
  return renderGenericComponent(component, layout);
}

function RenderLayoutGroup(
  layoutGroup: ILayoutGroup,
  layout: ILayout,
): JSX.Element {
  const groupComponents = layoutGroup.children.map((child) => {
    let childId = child;
    if (layoutGroup.edit?.multiPage) {
      childId = child.split(':')[1] || child;
    }
    return layout.find((c) => c.id === childId);
  });

  const repeating = layoutGroup.maxCount > 1;
  if (repeating) {
    return (
      <GroupContainer
        container={layoutGroup}
        id={layoutGroup.id}
        key={layoutGroup.id}
        components={groupComponents}
      />
    );
  }

  const panel = layoutGroup.panel;
  if (panel) {
    return (
      <PanelGroupContainer
        components={groupComponents}
        container={layoutGroup}
        key={layoutGroup.id}
      />
    );
  }

  //treat as regular components
  return (
    <DisplayGroupContainer
      key={layoutGroup.id}
      container={layoutGroup}
      components={groupComponents}
      renderLayoutComponent={renderLayoutComponent}
    />
  );
}

export function Form() {
  const currentView = useAppSelector(
    (state) => state.formLayout.uiConfig.currentView,
  );
  const layout = useAppSelector(
    (state) => state.formLayout.layouts[state.formLayout.uiConfig.currentView],
  );
  const language = useAppSelector((state) => state.language.language);
  const validations = useAppSelector(
    (state) => state.formValidations.validations,
  );
  const hasErrors = useAppSelector((state) =>
    getFormHasErrors(state.formValidations.validations),
  );

  const requiredFieldsMissing = React.useMemo(() => {
    if (validations && validations[currentView]) {
      return missingFieldsInLayoutValidations(
        validations[currentView],
        language,
      );
    }

    return false;
  }, [currentView, language, validations]);

  const [mainComponents, errorReportComponents] = React.useMemo(() => {
    if (layout && hasErrors) {
      const topLevel = topLevelComponents(layout);
      return extractBottomButtons(topLevel);
    } else if (layout) {
      return [topLevelComponents(layout), []];
    }
    return [[], []];
  }, [layout, hasErrors]);

  return (
    <>
      {hasRequiredFields(layout) && (
        <MessageBanner
          language={language}
          error={requiredFieldsMissing}
          messageKey={'form_filler.required_description'}
        />
      )}
      <Grid
        container={true}
        spacing={3}
        alignItems='flex-start'
      >
        {mainComponents.map((component) =>
          renderLayoutComponent(component, layout),
        )}
        <ErrorReport components={errorReportComponents} />
      </Grid>
    </>
  );
}
