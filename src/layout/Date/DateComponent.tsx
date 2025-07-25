import React from 'react';

import cn from 'classnames';
import { isValid, parseISO } from 'date-fns';

import classes from 'src/app-components/Date/Date.module.css';
import { DisplayDate } from 'src/app-components/Date/DisplayDate';
import { getLabelId } from 'src/components/label/Label';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { useLanguage } from 'src/features/language/useLanguage';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import { formatDateLocale } from 'src/utils/dateUtils';
import { useIndexedId } from 'src/utils/layout/DataModelLocation';
import { useItemWhenType } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';

export const DateComponent = ({ baseComponentId }: PropsFromGenericComponent<'Date'>) => {
  const item = useItemWhenType(baseComponentId, 'Date');
  const { textResourceBindings, direction: _direction, value, icon, format } = item;
  const direction = _direction ?? 'horizontal';
  const { langAsString } = useLanguage();
  const language = useCurrentLanguage();
  const parsedValue = parseISO(value);
  const indexedId = useIndexedId(baseComponentId);

  let displayData: string | null = null;
  try {
    displayData = isValid(parsedValue) ? formatDateLocale(language, parsedValue, format) : null;
    if (displayData?.includes('Unsupported: ')) {
      displayData = null;
      window.logErrorOnce(
        `Date component "${baseComponentId}" failed to format using "${format}": Unsupported token(s)`,
      );
    }
  } catch (err) {
    if (value?.trim() !== '') {
      window.logErrorOnce(`Date component "${baseComponentId}" failed to parse date "${value}":`, err);
    }
  }

  if (!textResourceBindings?.title) {
    return <DisplayDate value={displayData} />;
  }

  return (
    <ComponentStructureWrapper
      baseComponentId={baseComponentId}
      label={{
        baseComponentId,
        renderLabelAs: 'span',
        className: cn(
          classes.label,
          classes.dateComponent,
          direction === 'vertical' ? classes.vertical : classes.horizontal,
        ),
      }}
    >
      <DisplayDate
        value={displayData}
        iconUrl={icon}
        iconAltText={langAsString(textResourceBindings.title)}
        labelId={getLabelId(indexedId)}
      />
    </ComponentStructureWrapper>
  );
};
