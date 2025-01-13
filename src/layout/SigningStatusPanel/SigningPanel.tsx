import React from 'react';
import type { PropsWithChildren, ReactElement } from 'react';

import { ErrorMessage, Heading, Paragraph } from '@digdir/designsystemet-react';

import { Panel } from 'src/app-components/Panel/Panel';
import classes from 'src/layout/SigningStatusPanel/SigningStatusPanel.module.css';
import type { Button } from 'src/app-components/Button/Button';
import type { PanelProps } from 'src/app-components/Panel/Panel';

type SigningPanelProps = {
  heading: string;
  description?: string;
  variant?: PanelProps['variant'];
  actionButton: ReactElement<typeof Button>;
  secondaryButton?: ReactElement<typeof Button>;
  errorMessage?: string;
};

export function SigningPanel({
  heading,
  description,
  variant = 'info',
  secondaryButton,
  actionButton,
  errorMessage,
  children,
}: PropsWithChildren<SigningPanelProps>) {
  return (
    <Panel
      variant={variant}
      isOnBottom
      className={classes.signingPanel}
    >
      <div className={classes.contentContainer}>
        <Heading
          level={4}
          size='xs'
        >
          {heading}
        </Heading>
        {description && <Paragraph>{description}</Paragraph>}

        {children}
        <div>
          <div className={classes.buttonContainer}>
            {secondaryButton}
            {actionButton}
          </div>
          {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
        </div>
      </div>
    </Panel>
  );
}
