import React from 'react';

import cn from 'classnames';

import { Lang } from 'src/features/language/Lang';
import classes from 'src/layout/Text/TextComponent.module.css';
import type { PropsFromGenericComponent } from 'src/layout';

export const TextComponent = ({ node }: PropsFromGenericComponent<'Text'>) => {
  const { textResourceBindings, value, icon, direction } = node.item;

  if (icon) {
    const imgType = icon.split('.').at(-1);

    if (!imgType) {
      throw new Error('Image source is missing file type. Are you sure the image source is correct?');
    }
    if (!['svg', 'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff'].includes(imgType.toLowerCase())) {
      throw new Error('Only images of the types: .svg, .png, .jpg, .jpeg, .gif, .bmp, .tiff, are supported');
    }
  }

  if (!textResourceBindings?.title) {
    return;
  }

  return (
    <dd className={cn(classes.descriptionList, direction === 'vertical' ? classes.vertical : classes.horizontal)}>
      <dt>
        {!!icon && (
          <img
            src={icon}
            className={classes.icon}
            alt={textResourceBindings.title}
          />
        )}
        <Lang id={textResourceBindings.title} />
      </dt>
      <dl>{value}</dl>
    </dd>
  );
};
