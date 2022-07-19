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
import { useAppSelector, useAppDispatch } from 'src/common/hooks';
import MessageBanner from 'src/features/form/components/MessageBanner';
import { hasRequiredFields } from 'src/utils/formLayout';
import { missingFieldsInLayoutValidations } from 'src/utils/validation';
import { PanelGroupContainer } from './PanelGroupContainer';
import { getFormHasErrors } from 'src/components/message/ErrorReport';
import { getLanguageFromKey } from 'altinn-shared/utils';
import { FormLayoutActions } from 'src/features/form/layout/formLayoutSlice';

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
    return layout.find((c) => c.id === childId) as ILayoutComponent;
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
  const dispatch = useAppDispatch();
  const [filteredLayout, setFilteredLayout] = React.useState<any[]>([]);
  const [currentLayout, setCurrentLayout] = React.useState<string>();
  const [requiredFieldsMissing, setRequiredFieldsMissing] =
    React.useState(false);

  const hasErrors = useAppSelector((state) =>
    getFormHasErrors(state.formValidations.validations),
  );

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
  const bottomPadding = useAppSelector(
    (state) => state.formLayout.uiConfig.bottomPadding,
  );

  React.useEffect(() => {
    setCurrentLayout(currentView);
  }, [currentView]);

  React.useEffect(() => {
    if (validations && validations[currentView]) {
      const areRequiredFieldsMissing = missingFieldsInLayoutValidations(
        validations[currentView],
        language,
      );
      setRequiredFieldsMissing(areRequiredFieldsMissing);
    }
  }, [currentView, language, validations]);

  React.useEffect(() => {
    if (layout) {
      const errTitle = getLanguageFromKey(
        'form_filler.error_report_header',
        language,
      );

      const componentsToRender = hasErrors
        ? topLevelComponents(
            injectErrorPanel(topLevelComponents(layout), errTitle),
          )
        : topLevelComponents(layout);

      setFilteredLayout(componentsToRender);
    }
  }, [layout, hasErrors, language]);

  React.useEffect(() => {
    const endsWithPanel =
      currentView === currentLayout &&
      filteredLayout &&
      layoutEndsWithPanel(filteredLayout);

    if (endsWithPanel && bottomPadding) {
      dispatch(FormLayoutActions.disableBottomPadding());
    }

    return () => {
      if (!bottomPadding) {
        // Enable bottom padding again as soon as this component unmounts, to avoid
        // affecting any other pages or process stages
        dispatch(FormLayoutActions.enableBottomPadding());
      }
    };
  }, [bottomPadding, currentView, currentLayout, filteredLayout, dispatch]);

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
        {currentView === currentLayout &&
          filteredLayout &&
          filteredLayout.map((component) => {
            return renderLayoutComponent(component, layout);
          })}
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

function injectErrorPanel(layout: ILayout, errorTitle: string) {
  const consumeComponents = new Set<ComponentTypes>([
    'NavigationButtons',
    'Button',
    'PrintButton',
  ]);

  const errorPanelGroup: ILayoutGroup = {
    id: 'formErrorPanelGroup',
    type: 'Group',
    textResourceBindings: {
      title: errorTitle,
    },
    panel: {
      variant: 'warning',
      showIcon: false,
    },
    children: [],
  };

  for (const component of [...layout].reverse()) {
    if (consumeComponents.has(component.type)) {
      errorPanelGroup.children.push(component.id);
    } else {
      break;
    }
  }

  errorPanelGroup.children = errorPanelGroup.children.reverse();

  return [...layout, errorPanelGroup];
}

function layoutEndsWithPanel(layout: ILayout) {
  const lastComponent = layout[layout.length - 1];
  return (
    lastComponent.type === 'Panel' ||
    (lastComponent.type === 'Group' && !!lastComponent.panel)
  );
}
