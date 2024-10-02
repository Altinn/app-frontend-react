import React from 'react';
import type { HTMLAttributes } from 'react';

import cn from 'classnames';

import classes from 'src/components/form/Description.module.css';
import { getDescriptionId } from 'src/components/label/Label';

export type DescriptionProps = {
  description: React.ReactNode | string | undefined;
  id?: string;
} & HTMLAttributes<HTMLSpanElement>;

export function Description({ description, className, id, ...rest }: DescriptionProps) {
  if (!description) {
    return null;
  }

  return (
    <span
      {...rest}
      className={cn(classes.description, className)}
      id={getDescriptionId(id)}
      data-testid={getDescriptionId(id)}
    >
      {description}
    </span>
  );
}
