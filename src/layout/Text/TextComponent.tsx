import React from 'react';

import { Flex } from 'src/app-components/Flex/Flex';
import { DisplayText } from 'src/app-components/Text/DisplayText';
import { getLabelId, Label } from 'src/components/label/Label';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';

export const TextComponent = ({ node }: PropsFromGenericComponent<'Text'>) => {
  const { textResourceBindings, value, icon, direction } = useNodeItem(node);

  if (!textResourceBindings?.title) {
    return <DisplayText value={value} />;
  }

  return (
    <ComponentStructureWrapper node={node}>
      <Flex
        container
        direction={direction === 'vertical' ? 'column' : 'row'}
        justifyContent='space-between'
      >
        <Label
          node={node}
          renderLabelAs='span'
        />
        <DisplayText
          value={value}
          iconUrl={icon}
          iconAltText={textResourceBindings.title}
          labelId={getLabelId(node.id)}
        />
      </Flex>
    </ComponentStructureWrapper>
  );
};
