import React from 'react';

import { CheckmarkIcon, XMarkIcon } from '@navikt/aksel-icons';
import cn from 'classnames';

import { Spinner } from 'src/app-components/loading/Spinner/Spinner';
import { useIsProcessing } from 'src/core/contexts/processingContext';
import { useLayoutCollection } from 'src/features/form/layout/LayoutsContext';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import classes from 'src/features/navigation/components/Page.module.css';
import { useOnPageNavigationValidation } from 'src/features/validation/callbacks/onPageNavigationValidation';
import { SubformsForPage } from 'src/features/navigation/components/SubformsForPage';
import { useNavigationParam } from 'src/hooks/navigation';
import { useNavigatePage } from 'src/hooks/useNavigatePage';
import type { ILayoutFile } from 'src/layout/common.generated';

export function Page({
  page,
  onNavigate,
  hasErrors,
  isComplete,
}: {
  page: string;
  onNavigate?: () => void;
  hasErrors: boolean;
  isComplete: boolean;
}) {
  const currentPageId = useNavigationParam('pageKey');
  const isCurrentPage = page === currentPageId;

  const { navigateToPage } = useNavigatePage();
  const { performProcess, isAnyProcessing, isThisProcessing: isNavigating } = useIsProcessing();
  const onPageNavigationValidation = useOnPageNavigationValidation();
  const layoutCollection = useLayoutCollection();
  const { order, maybeSaveOnPageChange } = useNavigatePage();

  const handleNavigationClick = () =>
    performProcess(async () => {
      if (isCurrentPage) {
        return;
      }

      const currentIndex = order.indexOf(currentPageId ?? '');
      const newIndex = order.indexOf(page);

      //Her vil vi og kunne hindre bakover hvis vi setter "all" på preventNavigation
      const isForward = newIndex > currentIndex && currentIndex !== -1;

      // Get the layout data for the current page to check for validationOnNavigation
      const currentPageLayout = currentPageId ? layoutCollection[currentPageId] : undefined;
      const validationOnNavigation = currentPageLayout?.data
        ?.validationOnNavigation as ILayoutFile['data']['validationOnNavigation'];

      await maybeSaveOnPageChange();

      // Check validation if navigating forward and validationOnNavigation is configured
      if (isForward && validationOnNavigation && currentPageId) {
        const hasValidationErrors = await onPageNavigationValidation(currentPageId, validationOnNavigation);
        if (hasValidationErrors) {
          // Block navigation if validation fails
          return;
        }
      }

      await navigateToPage(page);
      onNavigate?.();
    });

  return (
    <li className={classes.pageListItem}>
      <button
        disabled={isAnyProcessing}
        aria-current={isCurrentPage ? 'page' : undefined}
        className={cn(classes.pageButton, 'fds-focus')}
        onClick={handleNavigationClick}
      >
        <PageSymbol
          error={hasErrors}
          complete={isComplete}
          active={isCurrentPage}
          isLoading={isNavigating}
        />
        <span className={cn(classes.pageName, { [classes.pageNameActive]: isCurrentPage })}>
          <Lang id={page} />
          {isComplete && (
            <span className='sr-only'>
              <Lang id='navigation.page_complete' />
            </span>
          )}
          {hasErrors && (
            <span className='sr-only'>
              <Lang id='navigation.page_error' />
            </span>
          )}
        </span>
      </button>
      <SubformsForPage pageKey={page} />
    </li>
  );
}

function PageSymbol({
  error,
  complete,
  active,
  isLoading,
}: {
  error: boolean;
  complete: boolean;
  active: boolean;
  isLoading: boolean;
}) {
  const { langAsString } = useLanguage();
  const showActive = active;
  const showError = error && !active;
  const showComplete = complete && !error && !active;

  const Icon = showError ? XMarkIcon : showComplete ? CheckmarkIcon : null;
  const testid = showError ? 'state-error' : showComplete ? 'state-complete' : undefined;

  if (isLoading) {
    return (
      <Spinner
        style={{ width: 20, height: 20 }}
        aria-label={langAsString('general.loading')}
      />
    );
  }

  return (
    <div
      className={cn(classes.pageSymbol, {
        [classes.pageSymbolActive]: showActive,
        [classes.pageSymbolError]: showError,
        [classes.pageSymbolComplete]: showComplete,
        [classes.pageSymbolDefault]: !showError && !showComplete,
      })}
    >
      {Icon && (
        <Icon
          aria-hidden
          data-testid={testid}
        />
      )}
    </div>
  );
}
