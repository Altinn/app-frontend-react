import React from 'react';

import { Button } from '@digdir/design-system-react';
import { Grid } from '@material-ui/core';

import { usePageNavigationContext } from 'src/features/form/layout/PageNavigationContext';
import { Lang } from 'src/features/language/Lang';
import { useOnPageValidation } from 'src/features/validation/validationProvider';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useNavigatePage } from 'src/hooks/useNavigatePage';
import classes from 'src/layout/NavigationButtons/NavigationButtonsComponent.module.css';
import { LayoutPage } from 'src/utils/layout/LayoutPage';
import type { PropsFromGenericComponent } from 'src/layout';
export type INavigationButtons = PropsFromGenericComponent<'NavigationButtons'>;

export function NavigationButtonsComponent({ node }: INavigationButtons) {
  const { id, showBackButton, textResourceBindings, validateOnNext, validateOnPrevious } = node.item;
  const dispatch = useAppDispatch();
  const { navigateToPage, next, previous } = useNavigatePage();
  const { returnToView, setReturnToView, scrollPosition, setScrollPosition } = usePageNavigationContext();

  const refPrev = React.useRef<HTMLButtonElement>(null);
  const refNext = React.useRef<HTMLButtonElement>(null);

  const nextTextKey = returnToView ? 'form_filler.back_to_summary' : textResourceBindings?.next || 'next';
  const backTextKey = textResourceBindings?.back || 'back';

  const parentIsPage = node.parent instanceof LayoutPage;

  const disablePrevious = previous === undefined;
  const disableNext = next === undefined;

  const onPageValidation = useOnPageValidation();

  const onClickPrevious = async () => {
    if (validateOnPrevious && (await onPageValidation(node.top, validateOnPrevious))) {
      // Block navigation if validation fails
      // TODO(Validation): Fix scrolling
      setScrollPosition({
        componentId: id,
        offsetTop: getScrollPosition(),
      });
      return;
    }

    if (previous && !disablePrevious) {
      navigateToPage(previous);
    }
  };

  const getScrollPosition = React.useCallback(
    () => (refNext.current || refPrev.current)?.getClientRects().item(0)?.y,
    [],
  );

  const OnClickNext = async () => {
    if (validateOnNext && (await onPageValidation(node.top, validateOnNext))) {
      // Block navigation if validation fails
      // TODO(Validation): Fix scrolling
      setScrollPosition({
        componentId: id,
        offsetTop: getScrollPosition(),
      });
      return;
    }

    const goToView = returnToView || next;

    if (!(goToView && !disableNext)) {
      return;
    }
    setReturnToView(undefined);
    navigateToPage(goToView);
  };

  React.useLayoutEffect(() => {
    if (!scrollPosition || typeof scrollPosition.offsetTop !== 'number' || scrollPosition.componentId !== id) {
      return;
    }

    const currentPos = getScrollPosition();
    if (typeof currentPos !== 'number') {
      return;
    }

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
            <Lang id={backTextKey} />
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
            <Lang id={nextTextKey} />
          </Button>
        </Grid>
      )}
    </div>
  );
}
