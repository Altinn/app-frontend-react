import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Spinner } from '@digdir/designsystemet-react';
import { CaretDownFillIcon } from '@navikt/aksel-icons';
import cn from 'classnames';

import { withFormEngine } from 'libs/FormEngineReact/components/FormEngineComponent';
import type { FormEngineComponentContext } from 'libs/FormEngineReact/components/FormEngineComponent';
import { useEngine } from 'libs/FormEngineReact';
import classes from './NavigationBarComponent.module.css';

interface NavigationBarProps {
  formEngine: FormEngineComponentContext;
  compact?: boolean;
  validateOnForward?: 'all' | 'currentPage';
  validateOnBackward?: 'all' | 'currentPage';
}

interface NavigationButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  current: boolean;
  hidden?: boolean;
  disabled?: boolean;
  'aria-expanded'?: boolean;
  'aria-controls'?: string;
  'aria-haspopup'?: boolean;
}

const NavigationButton = React.forwardRef<HTMLButtonElement, NavigationButtonProps>(
  function NavigationButton({ onClick, hidden = false, children, current, ...rest }, ref) {
    return (
      <button
        hidden={hidden}
        type="button"
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
    );
  }
);

/**
 * NavigationBar component for FormEngine
 * Displays page navigation with numbered buttons
 */
function NavigationBarComponentBase({ 
  formEngine, 
  compact = false,
  validateOnForward,
  validateOnBackward 
}: NavigationBarProps) {
  const { config, id, isVisible } = formEngine;
  const engine = useEngine();
  
  const [showMenu, setShowMenu] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingPageId, setProcessingPageId] = useState<string | null>(null);
  
  const firstPageLink = useRef<HTMLButtonElement>(null);

  // Get component configuration from config
  const configCompact = config.compact || compact;
  const configValidateOnForward = config.validateOnForward || validateOnForward;
  const configValidateOnBackward = config.validateOnBackward || validateOnBackward;

  // Get pages and navigation state from FormEngine
  const layoutService = engine.layout;
  const currentPageId = layoutService.getCurrentPage();
  const pageList = layoutService.getPageList();
  
  // Simple mobile detection (could be enhanced with proper hook)
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 600);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const shouldUseMobileView = isMobile || compact;

  const handleNavigationClick = async (targetPageId: string) => {
    if (targetPageId === currentPageId || isProcessing) {
      return;
    }

    setIsProcessing(true);
    setProcessingPageId(targetPageId);

    try {
      // Calculate navigation direction
      const currentIndex = pageList.indexOf(currentPageId);
      const targetIndex = pageList.indexOf(targetPageId);
      const isForward = targetIndex > currentIndex;
      const isBackward = targetIndex < currentIndex;

      // Validate if needed
      if (isForward && configValidateOnForward) {
        const hasErrors = await validatePageNavigation(configValidateOnForward);
        if (hasErrors) {
          return; // Block navigation
        }
      }

      if (isBackward && configValidateOnBackward) {
        const hasErrors = await validatePageNavigation(configValidateOnBackward);
        if (hasErrors) {
          return; // Block navigation
        }
      }

      // TODO: Save current page data (not implemented in data service yet)
      // await engine.data.saveCurrentPageData();

      // Navigate to target page
      layoutService.navigateToPage(targetPageId);
      
      // Close mobile menu
      setShowMenu(false);

    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      setIsProcessing(false);
      setProcessingPageId(null);
    }
  };

  const validatePageNavigation = async (validationType: string): Promise<boolean> => {
    try {
      // TODO: Implement proper page validation when validation service is enhanced
      // For now, just return false (no validation errors)
      console.log('Validation requested for', validationType, 'on page', currentPageId);
      return false;
    } catch (error) {
      console.error('Validation error:', error);
      return true; // Block navigation on validation error
    }
  };

  const getPageTitle = (pageId: string): string => {
    // Try to get page title from text resources, fallback to pageId
    return pageId; // TODO: Implement proper text resource lookup
  };

  const shouldShowMenu = !shouldUseMobileView || showMenu;

  const handleShowMenu = () => {
    setShowMenu(true);
  };

  useLayoutEffect(() => {
    if (firstPageLink.current && showMenu) {
      firstPageLink.current.focus();
    }
  }, [showMenu]);

  if (!isVisible || !pageList || pageList.length === 0) {
    return null;
  }

  return (
    <div style={{ display: 'flex', width: '100%' }}>
      <nav
        data-testid="NavigationBar"
        data-component-id={id}
        role="navigation"
        aria-label="Form navigation"
        style={{ width: '100%' }}
      >
        {shouldUseMobileView && (
          <NavigationButton
            hidden={showMenu}
            current={true}
            onClick={handleShowMenu}
            aria-expanded={showMenu}
            aria-controls="navigation-menu"
            aria-haspopup={true}
          >
            <span className={classes.dropdownMenuContent}>
              <span>
                {pageList.indexOf(currentPageId) + 1}/{pageList.length} {getPageTitle(currentPageId)}
              </span>
              <CaretDownFillIcon
                aria-hidden="true"
                className={classes.dropdownIcon}
              />
            </span>
          </NavigationButton>
        )}
        {shouldShowMenu && (
          <ul
            id="navigation-menu"
            data-testid="navigation-menu"
            className={cn(classes.menu, {
              [classes.menuCompact]: shouldUseMobileView,
            })}
          >
            {pageList.map((pageId, index) => (
              <li
                key={pageId}
                className={classes.containerBase}
              >
                <NavigationButton
                  disabled={isProcessing}
                  current={currentPageId === pageId}
                  onClick={() => handleNavigationClick(pageId)}
                  ref={index === 0 ? firstPageLink : null}
                >
                  <div className={classes.buttonContent}>
                    {processingPageId === pageId && (
                      <Spinner
                        className={classes.spinner}
                        aria-label="Loading"
                      />
                    )}
                    <span>
                      {index + 1}. {getPageTitle(pageId)}
                    </span>
                  </div>
                </NavigationButton>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </div>
  );
}

// Export wrapped component  
export const NavigationBarComponent = withFormEngine(NavigationBarComponentBase);