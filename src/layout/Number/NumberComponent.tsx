import React from 'react';

import { Flex } from 'src/app-components/Flex/Flex';
import { DisplayNumber } from 'src/app-components/Number/DisplayNumber';
import { getLabelId, Label } from 'src/components/label/Label';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';

export const NumberComponent = ({ node }: PropsFromGenericComponent<'Number'>) => {
  const { textResourceBindings, value, icon, direction, formatting } = useNodeItem(node);
  const currentLanguage = useCurrentLanguage();
  if (isNaN(value)) {
    return null;
  }

  if (!textResourceBindings?.title) {
    return (
      <DisplayNumber
        value={value}
        currentLanguage={currentLanguage}
        formatting={formatting}
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
        <DisplayNumber
          value={value}
          currentLanguage={currentLanguage}
          iconUrl={icon}
          iconAltText={textResourceBindings.title}
          labelId={getLabelId(node.id)}
          formatting={formatting}
        />
      </Flex>
    </ComponentStructureWrapper>
  );
};
