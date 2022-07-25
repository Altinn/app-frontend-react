import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import Grid from '@material-ui/core/Grid';

import { useAppDispatch, useAppSelector } from 'src/common/hooks';
import ErrorReport from 'src/components/message/ErrorReport';
import { SummaryComponent } from 'src/components/summary/SummaryComponent';
import MessageBanner from 'src/features/form/components/MessageBanner';
import { DisplayGroupContainer } from 'src/features/form/containers/DisplayGroupContainer';
import { mapGroupComponents } from 'src/features/form/containers/formUtils';
import { GroupContainer } from 'src/features/form/containers/GroupContainer';
import { PanelGroupContainer } from 'src/features/form/containers/PanelGroupContainer';
import { FormLayoutActions } from 'src/features/form/layout/formLayoutSlice';
import { ReadyForPrint } from 'src/shared/components/ReadyForPrint';
import {
  extractBottomButtons,
  hasRequiredFields,
  topLevelComponents,
} from 'src/utils/formLayout';
import { renderGenericComponent as RenderGenericComponent } from 'src/utils/layout';
import {
  getFormHasErrors,
  missingFieldsInLayoutValidations,
} from 'src/utils/validation';
import type {
  ILayout,
  ILayoutComponent,
  ILayoutGroup,
} from 'src/features/form/layout';
import type { IUpdateCurrentView } from 'src/features/form/layout/formLayoutTypes';

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

function RenderLayoutGroup(
  layoutGroup: ILayoutGroup,
  layout: ILayout,
): JSX.Element {
  const groupComponents = mapGroupComponents(layoutGroup, layout);

  const isRepeatingGroup = layoutGroup.maxCount > 1;
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

export function Form() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const viewState = location.state as IUpdateCurrentView;
  const params = useParams();
  const navigate = useNavigate();
  const [pageId] = params['*']?.split('/') || [''];
  const currentView = useAppSelector(
    (state) => state.formLayout.uiConfig.currentView,
  );
  const layout = useAppSelector(
    (state) => state.formLayout.layouts[currentView],
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
    if (!layout) {
      return [[], []];
    }
    const topLevel = topLevelComponents(layout);
    return hasErrors ? extractBottomButtons(topLevel) : [topLevel, []];
  }, [layout, hasErrors]);
  // handle root page
  useEffect(() => {
    if (!pageId) {
      if (currentView) {
        navigate(currentView, { replace: true });
      }
    }
    if (pageId !== currentView && hasErrors) {
      navigate(-1);
    }
  });
  if (viewState?.newView && viewState.newView !== currentView) {
    if (currentView !== pageId) {
      if (!hasErrors) {
        dispatch(FormLayoutActions.updateCurrentView(viewState));
      }
    }
  }
  if (!layout) {
    return <div>404</div>;
  }
  return (
    layout && (
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
        <ReadyForPrint />
      </>
    )
  );
}
