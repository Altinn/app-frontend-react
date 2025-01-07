import React from 'react';

import { DisplayDate } from 'src/app-components/Date/DisplayDate';
import { Flex } from 'src/app-components/Flex/Flex';
import { getLabelId, Label } from 'src/components/label/Label';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';

export const DateComponent = ({ node }: PropsFromGenericComponent<'Date'>) => {
  const { textResourceBindings, value, icon, direction, format } = useNodeItem(node);

  if (!textResourceBindings?.title) {
    return (
      <DisplayDate
        value={value}
        format={format}
      />
    );
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
        <DisplayDate
          value={value}
          iconUrl={icon}
          iconAltText={textResourceBindings.title}
          labelId={getLabelId(node.id)}
          format={format}
        />
      </Flex>
    </ComponentStructureWrapper>
  );
};
