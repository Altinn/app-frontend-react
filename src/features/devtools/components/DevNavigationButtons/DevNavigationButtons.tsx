import React from 'react';

import { LegacySelect } from '@digdir/design-system-react';
import { Chip, Fieldset } from '@digdir/designsystemet-react';
import cn from 'classnames';

import classes from 'src/features/devtools/components/DevNavigationButtons/DevNavigationButtons.module.css';
import { useIsInFormContext } from 'src/features/form/FormContext';
import { useLayoutSettings } from 'src/features/form/layoutSettings/LayoutSettingsContext';
import { useNavigationParam } from 'src/features/routing/AppRoutingContext';
import { useNavigatePage } from 'src/hooks/useNavigatePage';
import { Hidden } from 'src/utils/layout/NodesContext';
import { useNodeTraversal } from 'src/utils/layout/useNodeTraversal';

export function DevNavigationButtons() {
  const isInForm = useIsInFormContext();
  if (!isInForm) {
    return null;
  }

  return <InnerDevNavigationButtons />;
}

const InnerDevNavigationButtons = () => {
  const pageKey = useNavigationParam('pageKey');
  const { navigateToPage } = useNavigatePage();
  const isHiddenPage = Hidden.useIsHiddenPageSelector();
  const orderWithHidden = useLayoutSettings().pages.order;
  const order = orderWithHidden ?? [];
  const allPages = useNodeTraversal((t) => t.children().map((p) => p.pageKey));

  function handleChange(newView: string) {
    navigateToPage(newView);
  }

  function isHidden(page: string) {
    return isHiddenPage(page) || !orderWithHidden.includes(page);
  }

  function hiddenText(page: string) {
    if (isHiddenPage(page)) {
      return 'Denne siden er skjult for brukeren (via dynamikk)';
    } else if (!orderWithHidden.includes(page)) {
      return 'Denne siden er ikke med i siderekkefølgen';
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
              // TODO(DevTools): Navigate to hidden pages is not working
              disabled={isHidden(page)}
              onClick={() => handleChange(page)}
              selected={pageKey == page}
            >
              {page}
            </Chip.Toggle>
          ))}
        </Chip.Group>
      </div>
      <div className={cn(classes.dropdown, { [classes.responsiveDropdown]: !compactView })}>
        <LegacySelect
          value={pageKey}
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
