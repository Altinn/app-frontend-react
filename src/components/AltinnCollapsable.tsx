import React from 'react';
import type { PropsWithChildren } from 'react';

import cn from 'classnames';

import { Flex } from 'src/app-components/Flex/Flex';
import classes from 'src/components/AltinnCollapsable.module.css';

export interface IAltinnCollapsableListProps extends PropsWithChildren {
  open: boolean;
  /** Callback for click on expand/collapse */
  onClickExpand: () => void;
  /** React nodes values for the list header */
  listHeader: React.ReactNode;
}

export const AltinnCollapsibleList = ({ open, listHeader, onClickExpand, children }: IAltinnCollapsableListProps) => {
  function onKeyPress(event: React.KeyboardEvent) {
    event.stopPropagation();
    if (event.key === 'Enter' || event.key === ' ') {
      onClickExpand();
    }
  }

  return (
    <Flex
      container
      direction='column'
    >
      <Flex
        container
        direction='row'
        role='button'
        onClick={onClickExpand}
        onKeyPress={onKeyPress}
        tabIndex={0}
      >
        <Flex
          container
          direction='row'
        >
          {listHeader}
        </Flex>
      </Flex>
      <Flex item>
        <AltinnCollapsible open={open}>{children}</AltinnCollapsible>
      </Flex>
    </Flex>
  );
};

export function AltinnCollapsible({ children, open }: PropsWithChildren<{ open: boolean }>) {
  return (
    <div
      className={cn(classes.collapsable, {
        [classes.collapsableClosed]: !open,
      })}
    >
      {children}
    </div>
  );
}
