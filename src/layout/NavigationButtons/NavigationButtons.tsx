import * as React from 'react';

import { Grid } from '@material-ui/core';

import { useAppDispatch, useAppSelector } from 'src/common/hooks';
import { AltinnButton } from 'src/components/shared';
import { FormLayoutActions } from 'src/features/form/layout/formLayoutSlice';
import { getLayoutOrderFromTracks, selectLayoutOrder } from 'src/selectors/getLayoutOrder';
import { Triggers } from 'src/types';
import { getNextView } from 'src/utils/formLayout';
import { getTextFromAppOrDefault } from 'src/utils/textResource';
import type { IKeepComponentScrollPos } from 'src/features/form/layout/formLayoutTypes';
import type { PropsFromGenericComponent } from 'src/layout';
import type { ILayoutNavigation, IRuntimeState } from 'src/types';

export type INavigationButtons = PropsFromGenericComponent<'NavigationButtons'>;

export function NavigationButtons(props: INavigationButtons) {
  const dispatch = useAppDispatch();

  const refPrev = React.useRef<HTMLButtonElement>();
  const refNext = React.useRef<HTMLButtonElement>();

  const keepScrollPos = useAppSelector((state) => state.formLayout.uiConfig.keepScrollPos);

  const currentView = useAppSelector((state) => state.formLayout.uiConfig.currentView);
  const orderedLayoutKeys = useAppSelector(selectLayoutOrder);
  const returnToView = useAppSelector((state) => state.formLayout.uiConfig.returnToView);
  const textResources = useAppSelector((state) => state.textResources.resources);
  const language = useAppSelector((state) => state.language.language);
  const pageTriggers = useAppSelector((state) => state.formLayout.uiConfig.pageTriggers);
  const { next, previous } = useAppSelector((state) => getNavigationConfigForCurrentView(state));
  const triggers = props.triggers || pageTriggers;
  const nextTextKey = returnToView ? 'form_filler.back_to_summary' : props.textResourceBindings?.next || 'next';
  const backTextKey = props.textResourceBindings?.back || 'back';

  const currentViewIndex = orderedLayoutKeys?.indexOf(currentView);
  const disableBack = !!returnToView || (!previous && currentViewIndex === 0);
  const disableNext = !returnToView && !next && currentViewIndex === (orderedLayoutKeys?.length || 0) - 1;

  const onClickPrevious = () => {
    const goToView = previous || (orderedLayoutKeys && orderedLayoutKeys[orderedLayoutKeys.indexOf(currentView) - 1]);
    if (goToView) {
      dispatch(FormLayoutActions.updateCurrentView({ newView: goToView }));
    }
  };

  const getScrollPosition = React.useCallback(() => {
    return (refNext.current || refPrev.current)?.getClientRects().item(0)?.y;
  }, []);

  const OnClickNext = () => {
    const runPageValidations = !returnToView && triggers?.includes(Triggers.ValidatePage);
    const runAllValidations = returnToView || triggers?.includes(Triggers.ValidateAllPages);
    const runValidations = (runAllValidations && 'allPages') || (runPageValidations && 'page') || undefined;
    const keepScrollPosAction: IKeepComponentScrollPos = {
      componentId: props.id,
      offsetTop: getScrollPosition(),
    };

    if (triggers?.includes(Triggers.CalculatePageOrder)) {
      dispatch(
        FormLayoutActions.calculatePageOrderAndMoveToNextPage({
          runValidations,
          keepScrollPos: keepScrollPosAction,
        }),
      );
    } else {
      const goToView =
        returnToView || next || (orderedLayoutKeys && orderedLayoutKeys[orderedLayoutKeys.indexOf(currentView) + 1]);
      if (goToView) {
        dispatch(
          FormLayoutActions.updateCurrentView({
            newView: goToView,
            runValidations,
            keepScrollPos: keepScrollPosAction,
          }),
        );
      }
    }
  };

  React.useLayoutEffect(() => {
    if (!keepScrollPos || typeof keepScrollPos.offsetTop !== 'number' || keepScrollPos.componentId !== props.id) {
      return;
    }

    const currentPos = getScrollPosition();
    if (typeof currentPos !== 'number') {
      return;
    }

    window.scrollBy({ top: currentPos - keepScrollPos.offsetTop });
    dispatch(FormLayoutActions.clearKeepScrollPos());
  }, [keepScrollPos, dispatch, props.id, getScrollPosition]);

  if (!language) {
    return null;
  }

  return (
    <Grid
      data-testid='NavigationButtons'
      container
      spacing={1}
    >
      {!disableBack && props.showBackButton && (
        <Grid item>
          <AltinnButton
            ref={refPrev}
            btnText={getTextFromAppOrDefault(backTextKey, textResources, language, undefined, true)}
            onClickFunction={onClickPrevious}
            disabled={disableBack}
          />
        </Grid>
      )}
      {!disableNext && (
        <Grid item>
          <AltinnButton
            ref={refNext}
            btnText={getTextFromAppOrDefault(nextTextKey, textResources, language, undefined, true)}
            onClickFunction={OnClickNext}
            disabled={disableNext}
          />
        </Grid>
      )}
    </Grid>
  );
}

function getNavigationConfigForCurrentView(state: IRuntimeState): ILayoutNavigation {
  const currentView = state.formLayout.uiConfig.currentView;
  const navConfig =
    state.formLayout.uiConfig.navigationConfig && state.formLayout.uiConfig.navigationConfig[currentView];
  const order = getLayoutOrderFromTracks(state.formLayout.uiConfig.tracks);

  return {
    previous: getNextView(navConfig, order, currentView, true),
    next: getNextView(navConfig, order, currentView),
  };
}
