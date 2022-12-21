import React from 'react';

import Grid from '@material-ui/core/Grid';

import { useAppSelector } from 'src/common/hooks';
import ErrorReport from 'src/components/message/ErrorReport';
import { SummaryComponent } from 'src/components/summary/SummaryComponent';
import { DisplayGroupContainer } from 'src/features/form/containers/DisplayGroupContainer';
import { mapGroupComponents } from 'src/features/form/containers/formUtils';
import { GroupContainer } from 'src/features/form/containers/GroupContainer';
import { PanelGroupContainer } from 'src/layout/Panel/PanelGroupContainer';
import { ReadyForPrint } from 'src/shared/components/ReadyForPrint';
import { extractBottomButtons, topLevelComponents } from 'src/utils/formLayout';
import { renderGenericComponent } from 'src/utils/layout';
import { getFormHasErrors } from 'src/utils/validation';
import type { ILayoutGroup } from 'src/layout/Group/types';
import type { ILayout, ILayoutComponent } from 'src/layout/layout';

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

export function CustomReceipt() {
  const customReceipt = useAppSelector(
    (state) =>
      state.formLayout.layouts &&
      state.formLayout.uiConfig.receiptLayoutName &&
      state.formLayout.layouts[state.formLayout.uiConfig.receiptLayoutName],
  );
  const language = useAppSelector((state) => state.language.language);
  const hasErrors = useAppSelector((state) => getFormHasErrors(state.formValidations.validations));

  const [mainComponents, errorReportComponents] = React.useMemo(() => {
    if (!customReceipt) {
      return [[], []];
    }
    const topLevel = topLevelComponents(customReceipt);
    return hasErrors ? extractBottomButtons(topLevel) : [topLevel, []];
  }, [customReceipt, hasErrors]);

  if (!language || !customReceipt) {
    return null;
  }

  return (
    <>
      <Grid
        container={true}
        spacing={3}
        alignItems='flex-start'
      >
        {mainComponents.map((component) => renderLayoutComponent(component, customReceipt))}
        <ErrorReport components={errorReportComponents} />
      </Grid>
      <ReadyForPrint />
    </>
  );
}
