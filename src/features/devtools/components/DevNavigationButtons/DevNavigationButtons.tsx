import React from 'react';

import { Chip, Combobox, Fieldset } from '@digdir/designsystemet-react';
import cn from 'classnames';

import classes from 'src/features/devtools/components/DevNavigationButtons/DevNavigationButtons.module.css';
import { useIsInFormContext } from 'src/features/form/FormContext';
import { useLayouts } from 'src/features/form/layout/LayoutsContext';
import { useRawPageOrder } from 'src/features/form/layoutSettings/LayoutSettingsContext';
import { useNavigatePage } from 'src/features/navigation/useNavigatePage';
import { useNavigationParam } from 'src/features/routing/AppRoutingContext';
import comboboxClasses from 'src/styles/combobox.module.css';
import { Hidden } from 'src/utils/layout/NodesContext';

export function DevNavigationButtons() {
  const isInForm = useIsInFormContext();
  if (!isInForm) {
    return null;
  }

  return <InnerDevNavigationButtons />;
}

const InnerDevNavigationButtons = () => {
  const pageKey = useNavigationParam('pageKey');
  const { mutate: navigateToPage } = useNavigatePage().navigateToPageMutation;
  const isHiddenPage = Hidden.useIsHiddenPageSelector();
  const rawOrder = useRawPageOrder();
  const allPages = Object.keys(useLayouts() ?? {});

  function handleChange(values: string[]) {
    const newView = values.at(0);
    if (newView) {
      navigateToPage({ page: newView });
    }
  }

  function isHidden(page: string) {
    return isHiddenPage(page) || !rawOrder.includes(page);
  }

  function hiddenText(page: string) {
    if (isHiddenPage(page)) {
      return 'Denne siden er skjult for brukeren (via dynamikk)';
    } else if (!rawOrder.includes(page)) {
      return 'Denne siden er ikke med i siderekkefølgen';
    }
    return '';
  }

  if (!allPages.length) {
    return null;
  }

  // Order allPages by order
  const orderedPages = allPages.sort((a, b) => {
    const aIndex = rawOrder.indexOf(a);
    const bIndex = rawOrder.indexOf(b);
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
              onClick={() => handleChange([page])}
              selected={pageKey == page}
            >
              {page}
            </Chip.Toggle>
          ))}
        </Chip.Group>
      </div>
      <div className={cn(classes.dropdown, { [classes.responsiveDropdown]: !compactView })}>
        <Combobox
          size='sm'
          value={pageKey ? [pageKey] : []}
          onValueChange={handleChange}
          className={comboboxClasses.container}
        >
          {rawOrder.map((page) => (
            <Combobox.Option
              key={page}
              value={page}
              displayValue={page}
            >
              <span
                className={isHidden(page) ? classes.hiddenPage : undefined}
                title={hiddenText(page)}
              >
                {page}
              </span>
            </Combobox.Option>
          ))}
        </Combobox>
      </div>
    </Fieldset>
  );
};
