import React from 'react';

import Grid from '@material-ui/core/Grid';

import { useAppSelector } from 'src/common/hooks';
import ErrorReport from 'src/components/message/ErrorReport';
import { SummaryComponent } from 'src/components/summary/SummaryComponent';
import { DisplayGroupContainer } from 'src/features/form/containers/DisplayGroupContainer';
import { mapGroupComponents } from 'src/features/form/containers/formUtils';
import { GroupContainer } from 'src/features/form/containers/GroupContainer';
import { PanelGroupContainer } from 'src/features/form/containers/PanelGroupContainer';
import { ReadyForPrint } from 'src/shared/components/ReadyForPrint';
import { extractBottomButtons, topLevelComponents } from 'src/utils/formLayout';
import { renderGenericComponent } from 'src/utils/layout';
import { getFormHasErrors } from 'src/utils/validation';
import type { ILayout, ILayoutComponent, ILayoutGroup } from 'src/features/form/layout';

export function renderLayoutComponent(
  layoutComponent: ILayoutComponent | ILayoutGroup,
  layout: ILayout | undefined | null,
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
        <GenericComponent
          key={layoutComponent.id}
          {...layoutComponent}
        />
      );
    }
  }
}

function GenericComponent(component: ILayoutComponent, layout: ILayout) {
  return renderGenericComponent({ component, layout });
}

function RenderLayoutGroup(layoutGroup: ILayoutGroup, layout: ILayout | undefined | null): JSX.Element {
  const groupComponents = mapGroupComponents(layoutGroup, layout);

  const isRepeatingGroup = layoutGroup.maxCount && layoutGroup.maxCount > 1;
  if (isRepeatingGroup) {
    return (
      <GroupContainer
        container={layoutGroup}
        id={layoutGroup.id}
        key={layoutGroup.id}
        components={groupComponents}
      />
    );
  }

  const isPanel = layoutGroup.panel;
  if (isPanel) {
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

export function ConfirmationOnScreen() {
  const confirmationOnScreenFormLayout = useAppSelector(
    (state) => state.formLayout.layouts && state.formLayout.layouts?[state.formLayout.uiConfig.confirmationOnScreenFileName],
  );
  const language = useAppSelector((state) => state.language.language);
  const hasErrors = useAppSelector((state) => getFormHasErrors(state.formValidations.validations));

  const [mainComponents, errorReportComponents] = React.useMemo(() => {
    if (!confirmationOnScreenFormLayout) {
      return [[], []];
    }
    const topLevel = topLevelComponents(confirmationOnScreenFormLayout);
    return hasErrors ? extractBottomButtons(topLevel) : [topLevel, []];
  }, [confirmationOnScreenFormLayout, hasErrors]);

  if (!language || !confirmationOnScreenFormLayout) {
    return null;
  }

  return (
    <>
      <Grid
        container={true}
        spacing={3}
        alignItems='flex-start'
      >
        {mainComponents.map((component) => renderLayoutComponent(component, confirmationOnScreenFormLayout))}
        <ErrorReport components={errorReportComponents} />
      </Grid>
      <ReadyForPrint />
    </>
  );
}
