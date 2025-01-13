import React from 'react';

import cn from 'classnames';

import { getLabelId } from 'src/components/label/Label';
import { useLanguage } from 'src/features/language/useLanguage';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import { Date } from 'src/layout/Date/Date';
import classes from 'src/layout/Date/DateComponent.module.css';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';

export const DateComponent = ({ node }: PropsFromGenericComponent<'Date'>) => {
  const textResourceBindings = useNodeItem(node, (i) => i.textResourceBindings);
  const direction = useNodeItem(node, (i) => i.direction) ?? 'horizontal';
  const value = useNodeItem(node, (i) => i.value);
  const icon = useNodeItem(node, (i) => i.icon);
  const format = useNodeItem(node, (i) => i.format);
  const { langAsString } = useLanguage(node);

  if (!textResourceBindings?.title) {
    return (
      <Date
        value={value}
        format={format}
      />
    );
  }

  return (
    <ComponentStructureWrapper
      node={node}
      label={{
        node,
        renderLabelAs: 'span',
        className: cn(classes.dateComponent, direction === 'vertical' ? classes.vertical : classes.horizontal),
      }}
    >
      <Date
        value={value}
        iconUrl={icon}
        iconAltText={langAsString(textResourceBindings.title)}
        labelId={getLabelId(node.id)}
        format={format}
      />
    </ComponentStructureWrapper>
  );
};
