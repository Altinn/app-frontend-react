import React from 'react';

import { HelpText } from '@digdir/design-system-react';

import classes from 'src/components/form/HelpTextContainer.module.css';
import { useLanguage } from 'src/hooks/useLanguage';

export interface IHelpTextContainerProps {
  id?: string;
  helpText: React.ReactNode;
  title?: string;
}

export function HelpTextContainer({ helpText, title, id }: IHelpTextContainerProps) {
  const { langAsString } = useLanguage();
  return (
    <div className={classes.helpTextContainer}>
      <HelpText
        id={id}
        title={
          title ? `${langAsString('helptext.button_title_prefix')} ${title}` : langAsString('helptext.button_title')
        }
      >
        {helpText}
      </HelpText>
    </div>
  );
}
