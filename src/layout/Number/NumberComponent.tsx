import React from 'react';

import cn from 'classnames';

import { getLabelId } from 'src/components/label/Label';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { useLanguage } from 'src/features/language/useLanguage';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import { Number } from 'src/layout/Number/Number';
import classes from 'src/layout/Number/NumberComponent.module.css';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';

export const NumberComponent = ({ node }: PropsFromGenericComponent<'Number'>) => {
  const textResourceBindings = useNodeItem(node, (i) => i.textResourceBindings);
  const value = useNodeItem(node, (i) => i.value);
  const icon = useNodeItem(node, (i) => i.icon);
  const direction = useNodeItem(node, (i) => i.direction) ?? 'horizontal';
  const formatting = useNodeItem(node, (i) => i.formatting);
  const { langAsString } = useLanguage(node);
  const currentLanguage = useCurrentLanguage();

  if (isNaN(value)) {
    return null;
  }

  if (!textResourceBindings?.title) {
    return (
      <Number
        value={value}
        currentLanguage={currentLanguage}
        formatting={formatting}
      />
    );
  }

  return (
    <ComponentStructureWrapper
      node={node}
      label={{
        node,
        renderLabelAs: 'span',
        className: cn(classes.numberComponent, direction === 'vertical' ? classes.vertical : classes.horizontal),
      }}
    >
      <Number
        value={value}
        currentLanguage={currentLanguage}
        iconUrl={icon}
        iconAltText={langAsString(textResourceBindings.title)}
        labelId={getLabelId(node.id)}
        formatting={formatting}
      />
    </ComponentStructureWrapper>
  );
};
