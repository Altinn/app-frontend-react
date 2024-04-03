import React from 'react';

import { Card as DesignSystemCard } from '@digdir/design-system-react';

import styles from 'src/layout/Card/Card.module.css';
import type { CardColor, Position } from 'src/layout/Card/config.generated';

type CardInternalProps = {
  children?: React.ReactNode;
  color?: CardColor;
  position?: Position;
  title?: string;
  body?: string;
  footer?: string;
};

export const CardInternal = ({ children, color, position, title, body, footer }: CardInternalProps) => (
  <DesignSystemCard
    color={color}
    className={styles.container}
  >
    {position === 'top' && <DesignSystemCard.Media>{children}</DesignSystemCard.Media>}
    <DesignSystemCard.Header>{title}</DesignSystemCard.Header>
    <DesignSystemCard.Content>{body}</DesignSystemCard.Content>
    <DesignSystemCard.Footer>{footer}</DesignSystemCard.Footer>
    {position === 'bottom' && <DesignSystemCard.Media>{children}</DesignSystemCard.Media>}
  </DesignSystemCard>
);
