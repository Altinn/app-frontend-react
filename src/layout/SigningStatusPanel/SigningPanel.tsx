import React from 'react';
import type { PropsWithChildren, ReactElement } from 'react';

import { ErrorMessage, Heading, Paragraph } from '@digdir/designsystemet-react';

import { Panel } from 'src/app-components/Panel/Panel';
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
      style={{ paddingTop: '2rem' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Heading
          level={4}
          size='xs'
        >
          {heading}
        </Heading>
        {description && <Paragraph>{description}</Paragraph>}

        {children}
        <div>
          <div style={{ padding: '1rem 0', display: 'flex', gap: '1rem' }}>
            {secondaryButton}
            {actionButton}
          </div>
          {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
        </div>
      </div>
    </Panel>
  );
}
