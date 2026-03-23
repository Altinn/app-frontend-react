import React from 'react';

import cn from 'classnames';

import { DisplayText } from 'src/app-components/Text/DisplayText';
import classes from 'src/app-components/Text/Text.module.css';
import { getLabelId } from 'src/components/label/Label';
import { useLanguage } from 'src/features/language/useLanguage';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import { useItemWhenType } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';

export const TextComponent = ({ baseComponentId }: PropsFromGenericComponent<'Text'>) => {
  const { id, textResourceBindings, value, icon, direction: _direction } = useItemWhenType(baseComponentId, 'Text');
  const direction = _direction ?? 'horizontal';
  const { langAsString } = useLanguage();

  const iconElement = icon && (
    <img
      src={icon}
      className={classes.icon}
      alt={textResourceBindings?.title ? langAsString(textResourceBindings.title) : ''}
    />
  );

  if (!textResourceBindings?.title) {
    return (
      <div
        className={cn(
          classes.textComponent,
          direction === 'vertical' ? classes.vertical : classes.horizontal,
        )}
      >
        {iconElement}
        <DisplayText value={value} />
      </div>
    );
  }

  return (
    <ComponentStructureWrapper
      baseComponentId={baseComponentId}
      label={{
        baseComponentId,
        renderLabelAs: 'span',
        labelPrefix: iconElement,
        className: cn(
          classes.label,
          classes.textComponent,
          direction === 'vertical' ? classes.vertical : classes.horizontal,
        ),
      }}
    >
      <DisplayText
        value={value}
        labelId={getLabelId(id)}
      />
    </ComponentStructureWrapper>
  );
};
