import React from 'react';
import type { PropsWithChildren, ReactElement } from 'react';

import { Heading } from '@digdir/designsystemet-react';

import { Panel } from 'src/app-components/Panel/Panel';
import type { Button } from 'src/app-components/Button/Button';
import type { PanelProps } from 'src/app-components/Panel/Panel';

type SigningPanelProps = {
  heading: string;
  description?: string;
  variant?: PanelProps['variant'];
  actionButton: ReactElement<typeof Button>;
  secondaryButton?: ReactElement<typeof Button>;
};

export function SigningPanel({
  heading,
  description,
  variant = 'info',
  secondaryButton,
  actionButton,
  children,
}: PropsWithChildren<SigningPanelProps>) {
  return (
    <Panel
      variant={variant}
      isOnBottom
      style={{ paddingTop: '2rem' }}
    >
      <Heading
        level={4}
        size='xs'
      >
        {heading}
      </Heading>
      {description && <p>{description}</p>}
      {children}
      <div style={{ paddingTop: '2rem', display: 'flex', gap: '1rem' }}>
        {secondaryButton}
        {actionButton}
      </div>
    </Panel>
  );
}
