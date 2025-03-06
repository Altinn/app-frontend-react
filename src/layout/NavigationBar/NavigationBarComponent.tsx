import React from 'react';

import { CaretDownFillIcon } from '@navikt/aksel-icons';
import cn from 'classnames';

import { Flex } from 'src/app-components/Flex/Flex';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { useNavigatePage } from 'src/features/navigation/useNavigatePage';
import { useNavigationParam } from 'src/features/routing/AppRoutingContext';
import { useOnPageNavigationValidation } from 'src/features/validation/callbacks/onPageNavigationValidation';
import { useIsMobile } from 'src/hooks/useDeviceWidths';
import { useHasLongLivedMutations } from 'src/hooks/useHasLongLivedMutations';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import classes from 'src/layout/NavigationBar/NavigationBarComponent.module.css';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';

export type INavigationBar = PropsFromGenericComponent<'NavigationBar'>;

interface INavigationButton {
  onClick: () => void;
  children: React.ReactNode;
  current: boolean;
  hidden?: boolean;
  disabled?: boolean;
}

const NavigationButton = React.forwardRef(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ({ onClick, hidden = false, children, current, ...rest }: INavigationButton, ref: any) => (
    <button
      hidden={hidden}
      type='button'
      className={cn(classes.buttonBase, {
        [classes.buttonSelected]: current,
        [classes.hidden]: hidden,
      })}
      onClick={onClick}
      ref={ref}
      {...(current && { 'aria-current': 'page' })}
      {...rest}
    >
      {children}
    </button>
  ),
);

NavigationButton.displayName = 'NavigationButton';

export const NavigationBarComponent = ({ node }: INavigationBar) => {
  const { compact, validateOnForward, validateOnBackward } = useNodeItem(node);
  const [showMenu, setShowMenu] = React.useState(false);
  const isMobile = useIsMobile() || compact === true;
  const { langAsString } = useLanguage();
  const currentPageId = useNavigationParam('pageKey') ?? '';
  const {
    navigateToPageMutation: { mutateAsync: navigateToPage },
    order,
    maybeSaveOnPageChange,
  } = useNavigatePage();
  const onPageNavigationValidation = useOnPageNavigationValidation();
  const hasLongLivedMutations = useHasLongLivedMutations();

  const firstPageLink = React.useRef<HTMLButtonElement>();

  async function handlePageNavigation(pageId: string) {
    const currentIndex = order.indexOf(currentPageId);
    const newIndex = order.indexOf(pageId);

    const isForward = newIndex > currentIndex && currentIndex !== -1;
    const isBackward = newIndex < currentIndex && currentIndex !== -1;

    if (pageId === currentPageId || newIndex === -1) {
      return;
    }

    await maybeSaveOnPageChange();

    if (isForward && validateOnForward && (await onPageNavigationValidation(node.page, validateOnForward))) {
      // Block navigation if validation fails
      return;
    }

    if (isBackward && validateOnBackward && (await onPageNavigationValidation(node.page, validateOnBackward))) {
      // Block navigation if validation fails
      return;
    }

    setShowMenu(false);
    navigateToPage({ page: pageId, options: { skipAutoSave: true } });
  }

  const shouldShowMenu = !isMobile || showMenu;

  const handleShowMenu = () => {
    setShowMenu(true);
  };

  React.useLayoutEffect(() => {
    const shouldFocusFirstItem = firstPageLink.current && showMenu;
    if (shouldFocusFirstItem) {
      firstPageLink.current?.focus();
    }
  }, [showMenu]);

  if (!order) {
    return null;
  }

  return (
    <ComponentStructureWrapper node={node}>
      <Flex container>
        <Flex
          data-testid='NavigationBar'
          item
          component='nav'
          size={{ xs: 12 }}
          role='navigation'
          aria-label={langAsString('general.navigation_form')}
        >
          {isMobile && (
            <NavigationButton
              hidden={showMenu}
              current={true}
              onClick={handleShowMenu}
              aria-expanded={showMenu}
              aria-controls='navigation-menu'
              aria-haspopup='true'
            >
              <span className={classes.dropdownMenuContent}>
                <span>
                  {order.indexOf(currentPageId) + 1}/{order.length} <Lang id={currentPageId} />
                </span>
                <CaretDownFillIcon
                  aria-hidden='true'
                  className={classes.dropdownIcon}
                />
              </span>
            </NavigationButton>
          )}
          {shouldShowMenu && (
            <ul
              id='navigation-menu'
              data-testid='navigation-menu'
              className={cn(classes.menu, {
                [classes.menuCompact]: isMobile,
              })}
            >
              {order.map((pageId, index) => (
                <li
                  key={pageId}
                  className={classes.containerBase}
                >
                  <NavigationButton
                    disabled={hasLongLivedMutations}
                    current={currentPageId === pageId}
                    onClick={() => handlePageNavigation(pageId)}
                    ref={index === 0 ? firstPageLink : null}
                  >
                    <div className={classes.buttonContent}>
                      <span>
                        {index + 1}. <Lang id={pageId} />
                      </span>
                    </div>
                  </NavigationButton>
                </li>
              ))}
            </ul>
          )}
        </Flex>
      </Flex>
    </ComponentStructureWrapper>
  );
};
