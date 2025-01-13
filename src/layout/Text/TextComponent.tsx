import React from 'react';

import cn from 'classnames';

import { getLabelId } from 'src/components/label/Label';
import { useLanguage } from 'src/features/language/useLanguage';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import { Text } from 'src/layout/Text/Text';
import classes from 'src/layout/Text/TextComponent.module.css';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';

export const TextComponent = ({ node }: PropsFromGenericComponent<'Text'>) => {
  const textResourceBindings = useNodeItem(node, (i) => i.textResourceBindings);
  const value = useNodeItem(node, (i) => i.value);
  const icon = useNodeItem(node, (i) => i.icon);
  const direction = useNodeItem(node, (i) => i.direction) ?? 'horizontal';
  const { langAsString } = useLanguage(node);

  if (!textResourceBindings?.title) {
    return <Text value={value} />;
  }

  return (
    <ComponentStructureWrapper
      node={node}
      label={{
        node,
        renderLabelAs: 'span',
        className: cn(classes.textComponent, direction === 'vertical' ? classes.vertical : classes.horizontal),
      }}
    >
      <Text
        value={value}
        iconUrl={icon}
        iconAltText={langAsString(textResourceBindings.title)}
        labelId={getLabelId(node.id)}
      />
    </ComponentStructureWrapper>
  );
};
