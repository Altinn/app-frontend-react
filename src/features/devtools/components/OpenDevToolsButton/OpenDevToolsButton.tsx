import React from 'react';

import { Button, ButtonColor, ButtonVariant } from '@digdir/design-system-react';
import { CodeIcon } from '@navikt/aksel-icons';
import cn from 'classnames';

import classes from 'src/features/devtools/components/OpenDevToolsButton/OpenDevToolsButton.module.css';

interface IOpenDevToolsButtonProps {
  isHidden: boolean;
  onClick: () => void;
}

export const OpenDevToolsButton = ({ isHidden, onClick }: IOpenDevToolsButtonProps) => (
  <div className={cn(classes.devToolsButton, { [classes.hidden]: isHidden })}>
    <Button
      variant={ButtonVariant.Outline}
      color={ButtonColor.Secondary}
      onClick={onClick}
      aria-label='åpne utviklerverkøy'
      icon={<CodeIcon aria-hidden />}
    />
  </div>
);
