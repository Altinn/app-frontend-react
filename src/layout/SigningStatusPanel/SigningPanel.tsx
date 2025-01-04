import React from 'react';
import type { PropsWithChildren, ReactElement } from 'react';

import { Heading } from '@digdir/designsystemet-react';

import { Panel } from 'src/app-components/Panel/Panel';
import { FullWidthWrapper } from 'src/components/form/FullWidthWrapper';
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
    <FullWidthWrapper isOnBottom>
      <Panel variant={variant}>
        <div style={{ padding: '1rem' }}>
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
        </div>
      </Panel>
    </FullWidthWrapper>
  );
}
