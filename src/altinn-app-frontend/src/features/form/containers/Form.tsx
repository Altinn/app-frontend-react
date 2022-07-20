import Grid from '@material-ui/core/Grid';
import React from 'react';
import { SummaryComponent } from 'src/components/summary/SummaryComponent';
import type {
  ILayout,
  ILayoutComponent,
  ILayoutGroup,
  ComponentTypes,
} from '../layout';
import { GroupContainer } from './GroupContainer';
import { renderGenericComponent } from 'src/utils/layout';
import { DisplayGroupContainer } from './DisplayGroupContainer';
import { useAppSelector } from 'src/common/hooks';
import MessageBanner from 'src/features/form/components/MessageBanner';
import { hasRequiredFields } from 'src/utils/formLayout';
import { missingFieldsInLayoutValidations } from 'src/utils/validation';
import { PanelGroupContainer } from './PanelGroupContainer';
import ErrorReport, { getFormErrors } from 'src/components/message/ErrorReport';

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
  const formErrors = useAppSelector((state) =>
    getFormErrors(state.formValidations.validations),
  );
  const hasErrors = formErrors.length > 0;

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

function topLevelComponents(layout: ILayout) {
  const inGroup = new Set<string>();
  layout.forEach((component) => {
    if (component.type === 'Group') {
      const childList = component.edit?.multiPage
        ? component.children.map((childId) => childId.split(':')[1] || childId)
        : component.children;
      childList.forEach((childId) => inGroup.add(childId));
    }
  });
  return layout.filter((component) => !inGroup.has(component.id));
}

function extractBottomButtons(layout: ILayout) {
  const extract = new Set<ComponentTypes>([
    'NavigationButtons',
    'Button',
    'PrintButton',
  ]);

  const toMainLayout: ILayout = [];
  const toErrorReport: ILayout = [];
  for (const component of [...layout].reverse()) {
    if (extract.has(component.type) && toMainLayout.length === 0) {
      toErrorReport.push(component);
    } else {
      toMainLayout.push(component);
    }
  }

  return [toMainLayout.reverse(), toErrorReport.reverse()];
}
