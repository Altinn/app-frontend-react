import React from 'react';

import { Card, Heading, Paragraph } from '@digdir/designsystemet-react';
import Grid from '@material-ui/core/Grid';

import classes from 'src/app-components/Card/Card.module.css';

type AppCardProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  media?: React.ReactNode;
  mediaPosition?: 'top' | 'bottom';
  color?: Parameters<typeof Card>[0]['color'];
  children?: React.ReactNode;
};

export function AppCard({ title, description, footer, media, color, mediaPosition = 'top', children }: AppCardProps) {
  return (
    <Card color={color}>
      {media && mediaPosition === 'top' && <Card.Block className={classes.mediaCard}>{media}</Card.Block>}
      {(title || description) && (
        <Card.Block>
          {title && <Heading data-size='md'>{title}</Heading>}
          {description && <Paragraph>{description}</Paragraph>}
        </Card.Block>
      )}
      {children && (
        <Card.Block>
          <Grid
            container
            spacing={6}
          >
            {children}
          </Grid>
        </Card.Block>
      )}
      {footer && (
        <Card.Block>
          <Paragraph data-size='sm'>{footer}</Paragraph>
        </Card.Block>
      )}
      {media && mediaPosition === 'bottom' && <Card.Block className={classes.mediaCard}>{media}</Card.Block>}
    </Card>
  );
}
