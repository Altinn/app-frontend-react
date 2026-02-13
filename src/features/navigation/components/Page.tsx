import React from 'react';

import { CheckmarkIcon, XMarkIcon } from '@navikt/aksel-icons';
import cn from 'classnames';

import { Spinner } from 'src/app-components/loading/Spinner/Spinner';
import { useIsProcessing } from 'src/core/contexts/processingContext';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import classes from 'src/features/navigation/components/Page.module.css';
import { SubformsForPage } from 'src/features/navigation/components/SubformsForPage';
import { useNavigationIsPrevented } from 'src/features/navigation/utils';
import { useOnPageNavigationValidation } from 'src/features/validation/callbacks/onPageNavigationValidation';
import { useNavigationParam } from 'src/hooks/navigation';
import { useNavigatePage } from 'src/hooks/useNavigatePage';
import { useEffectivePageValidation } from 'src/hooks/usePageValidation';

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

  const { navigateToPage, order, maybeSaveOnPageChange } = useNavigatePage();
  const { performProcess, isAnyProcessing, isThisProcessing: isNavigating } = useIsProcessing();
  const onPageNavigationValidation = useOnPageNavigationValidation();
  const { getPageValidation } = useEffectivePageValidation(currentPageId ?? '');

  const navigationIsPrevented = useNavigationIsPrevented(page);

  const handleNavigationClick = () =>
    performProcess(async () => {
      if (isCurrentPage || !currentPageId) {
        return;
      }
      const currentIndex = order.indexOf(currentPageId);
      const targetIndex = order.indexOf(page);
      if (currentIndex === -1 || targetIndex === -1) {
        return;
      }

      const isForward = targetIndex > currentIndex;
      const validationOnNavigation = getPageValidation();

      await maybeSaveOnPageChange();

      if (isForward && validationOnNavigation) {
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
        disabled={isAnyProcessing || navigationIsPrevented}
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
