import React from 'react';

import cn from 'classnames';

import { getLabelId } from 'src/components/label/Label';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { useGetOptions } from 'src/features/options/useGetOptions';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import classes from 'src/layout/Option/Option.module.css';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export const OptionComponent = ({ node }: PropsFromGenericComponent<'Option'>) => {
  const textResourceBindings = useNodeItem(node, (i) => i.textResourceBindings);
  const direction = useNodeItem(node, (i) => i.direction);

  if (!textResourceBindings?.title) {
    return <Text node={node} />;
  }

  return (
    <ComponentStructureWrapper
      node={node}
      label={{
        node,
        renderLabelAs: 'span',
        className: cn(classes.optionComponent, direction === 'vertical' ? classes.vertical : classes.horizontal),
      }}
    >
      <Text node={node} />
    </ComponentStructureWrapper>
  );
};

interface TextProps {
  node: LayoutNode<'Option'>;
}

function Text({ node }: TextProps) {
  const textResourceBindings = useNodeItem(node, (i) => i.textResourceBindings);
  const icon = useNodeItem(node, (i) => i.icon);
  const value = useNodeItem(node, (i) => i.value);
  const { options, isFetching } = useGetOptions(node, 'single');
  const { langAsString } = useLanguage(node);
  const selectedOption = options.find((option) => option.value === value);

  if (isFetching) {
    return null;
  }

  return (
    <>
      {icon && textResourceBindings?.title && (
        <img
          src={icon}
          className={classes.icon}
          alt={langAsString(textResourceBindings.title)}
        />
      )}
      <span aria-labelledby={getLabelId(node.id)}>
        <Lang id={selectedOption?.label} />
      </span>
    </>
  );
}
