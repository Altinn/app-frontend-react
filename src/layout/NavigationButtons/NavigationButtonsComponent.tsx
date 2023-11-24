import React from 'react';

import { Button } from '@digdir/design-system-react';
import { Grid } from '@material-ui/core';

import { usePageNavigationContext } from 'src/features/form/layout/PageNavigationContext';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useLanguage } from 'src/hooks/useLanguage';
import { useNavigatePage } from 'src/hooks/useNavigatePage';
import classes from 'src/layout/NavigationButtons/NavigationButtonsComponent.module.css';
import { reducePageValidations } from 'src/types';
import { LayoutPage } from 'src/utils/layout/LayoutPage';
import type { IComponentScrollPos } from 'src/features/form/layout/formLayoutTypes';
import type { PropsFromGenericComponent } from 'src/layout';
export type INavigationButtons = PropsFromGenericComponent<'NavigationButtons'>;

export function NavigationButtonsComponent({ node }: INavigationButtons) {
  const { id, showBackButton, textResourceBindings, triggers } = node.item;
  const dispatch = useAppDispatch();
  const { lang } = useLanguage();
  const { navigateToPage, next, previous } = useNavigatePage();
  const { returnToView, setReturnToView, scrollPosition, setScrollPosition } = usePageNavigationContext();

  const refPrev = React.useRef<HTMLButtonElement>(null);
  const refNext = React.useRef<HTMLButtonElement>(null);

  const pageTriggers = useAppSelector((state) => state.formLayout.uiConfig.pageTriggers);
  const activeTriggers = triggers || pageTriggers;
  const nextTextKey = returnToView ? 'form_filler.back_to_summary' : textResourceBindings?.next || 'next';
  const backTextKey = textResourceBindings?.back || 'back';

  const parentIsPage = node.parent instanceof LayoutPage;

  const disablePrevious = previous === undefined;
  const disableNext = next === undefined;

  console.log('NEXT: ', next);
  console.log('Previous: ', previous);

  const onClickPrevious = () => {
    if (previous && !disablePrevious) {
      navigateToPage(previous);
    }
  };

  const getScrollPosition = React.useCallback(
    () => (refNext.current || refPrev.current)?.getClientRects().item(0)?.y,
    [],
  );

  const OnClickNext = () => {
    // eslint-disable-next-line unused-imports/no-unused-vars
    // @ts-expect-error Keeping this to know where validations were previously run.
    const runValidations = reducePageValidations(activeTriggers);
    const keepScrollPosAction: IComponentScrollPos = {
      componentId: id,
      offsetTop: getScrollPosition(),
    };

    const goToView = returnToView || next;
    if (goToView && !disableNext) {
      setScrollPosition(keepScrollPosAction);
      setReturnToView(undefined);
      navigateToPage(goToView);
    }
  };

  React.useLayoutEffect(() => {
    if (!scrollPosition || typeof scrollPosition.offsetTop !== 'number' || scrollPosition.componentId !== id) {
      return;
    }

    const currentPos = getScrollPosition();
    if (typeof currentPos !== 'number') {
      return;
    }

    // TODO: test this when validations are rewritten.
    window.scrollBy({ top: currentPos - scrollPosition.offsetTop });
    setScrollPosition(undefined);
  }, [scrollPosition, dispatch, id, getScrollPosition, setScrollPosition]);

  return (
    <div
      data-testid='NavigationButtons'
      className={classes.container}
      style={{ marginTop: parentIsPage ? 'var(--button-margin-top)' : undefined }}
    >
      {!disablePrevious && showBackButton && (
        <Grid item>
          <Button
            ref={refPrev}
            size='small'
            onClick={onClickPrevious}
            disabled={disablePrevious}
          >
            {lang(backTextKey)}
          </Button>
        </Grid>
      )}
      {!disableNext && (
        <Grid item>
          <Button
            ref={refNext}
            size='small'
            onClick={OnClickNext}
            disabled={disableNext}
          >
            {lang(nextTextKey)}
          </Button>
        </Grid>
      )}
    </div>
  );
}
