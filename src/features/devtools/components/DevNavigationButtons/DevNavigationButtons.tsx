import React from 'react';

import { Chip, Fieldset, Select } from '@digdir/design-system-react';
import cn from 'classnames';

import classes from 'src/features/devtools/components/DevNavigationButtons/DevNavigationButtons.module.css';
import { usePageNavigationContext } from 'src/features/form/layout/PageNavigationContext';
import { useUiConfigContext } from 'src/features/form/layout/UiConfigContext';
import { useNavigatePage } from 'src/hooks/useNavigatePage';
import { useExprContext } from 'src/utils/layout/ExprContext';

export const DevNavigationButtons = () => {
  const { navigateToPage, currentPageId } = useNavigatePage();
  const { hidden } = usePageNavigationContext();
  const { orderWithHidden } = useUiConfigContext();
  const ctx = useExprContext();
  const order = orderWithHidden ?? [];
  const allPages = ctx?.allPageKeys() || [];

  function handleChange(newView: string) {
    navigateToPage(newView);
  }

  function isHidden(page: string) {
    return hidden.includes(page);
  }

  function hiddenText(page: string) {
    if (isHidden(page)) {
      return 'Denne siden er skjult for brukeren (via dynamikk)';
    }
    return '';
  }

  if (!allPages.length) {
    return null;
  }

  // Order allPages by order
  const orderedPages = allPages.sort((a, b) => {
    const aIndex = order.indexOf(a);
    const bIndex = order.indexOf(b);
    if (aIndex === -1 && bIndex === -1) {
      return 0;
    }
    if (aIndex === -1) {
      return 1;
    }
    if (bIndex === -1) {
      return -1;
    }
    return aIndex - bIndex;
  });

  const compactView = allPages.length > 8;

  return (
    <Fieldset legend='Navigasjon'>
      <div className={compactView ? classes.hidden : classes.responsiveButtons}>
        <Chip.Group
          size='small'
          className={classes.chipGroup}
        >
          {orderedPages.map((page) => (
            <Chip.Toggle
              key={page}
              className={isHidden(page) ? classes.hiddenPage : undefined}
              title={hiddenText(page)}
              onClick={() => handleChange(page)}
              selected={currentPageId == page}
            >
              {page}
            </Chip.Toggle>
          ))}
        </Chip.Group>
      </div>
      <div className={cn(classes.dropdown, { [classes.responsiveDropdown]: !compactView })}>
        <Select
          value={currentPageId}
          options={
            order?.map((page) => ({
              value: page,
              label: page,
              formattedLabel: (
                <span
                  className={isHidden(page) ? classes.hiddenPage : classes.visiblePage}
                  title={hiddenText(page)}
                >
                  {page}
                </span>
              ),
            })) ?? []
          }
          onChange={handleChange}
        />
      </div>
    </Fieldset>
  );
};
