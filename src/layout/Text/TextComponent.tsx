import React from 'react';

import { Lang } from 'src/features/language/Lang';
import classes from 'src/layout/Text/TextComponent.module.css';
import type { PropsFromGenericComponent } from 'src/layout';

export const TextComponent = ({ node }: PropsFromGenericComponent<'Text'>) => {
  const { textResourceBindings, value } = node.item;

  if (!textResourceBindings?.title) {
    return;
  }

  return (
    <dd className={classes.descriptionList}>
      <dt>
        <Lang id={textResourceBindings.title} />
      </dt>
      <dl>{value}</dl>
    </dd>
  );
};
