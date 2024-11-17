import React from 'react';

import cn from 'classnames';

import { Flex } from 'src/components/Flex';
import { getLabelId, Label } from 'src/components/label/Label';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import { Text } from 'src/layout/Text/Text';
import classes from 'src/layout/Text/TextComponent.module.css';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';

export const TextComponent = ({ node }: PropsFromGenericComponent<'Text'>) => {
  const { textResourceBindings, value, icon, direction } = useNodeItem(node);

  if (!textResourceBindings?.title) {
    return <Text value={value} />;
  }

  return (
    <ComponentStructureWrapper node={node}>
      <Flex
        container
        direction={direction === 'vertical' ? 'column' : 'row'}
        style={{ whiteSpace: 'nowrap' }}
      >
        <Label
          node={node}
          renderLabelAs='span'
          className={cn(classes.textComponent, direction === 'vertical' ? classes.vertical : classes.horizontal)}
        />
        <Text
          value={value}
          iconUrl={icon}
          iconAltText={textResourceBindings.title}
          labelId={getLabelId(node.id)}
        />
      </Flex>
    </ComponentStructureWrapper>
  );
};
