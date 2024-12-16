import React from 'react';

import { Collapse } from '@material-ui/core';

import { Flex } from 'src/app-components/Flex/Flex';

export interface IAltinnCollapsableListProps {
  /** Boolean value for if the animation will transition */
  transition: boolean;
  /** Callback for click on expand */
  onClickExpand: () => void;
  /** React nodes values for the list header */
  listHeader: React.ReactNode;
  children: React.ReactNode;
}

export const AltinnCollapsableList = ({
  transition,
  listHeader,
  onClickExpand,
  children,
}: IAltinnCollapsableListProps) => {
  function onKeyPress(event: React.KeyboardEvent) {
    event.stopPropagation();
    if (event.key === 'Enter' || event.key === ' ') {
      onClickExpand();
    }
  }

  return (
    <Flex container>
      <Flex
        onClick={onClickExpand}
        onKeyPress={onKeyPress}
        tabIndex={0}
      >
        <Flex>{listHeader}</Flex>
      </Flex>
      <Flex>
        <Collapse in={transition}>{children}</Collapse>
      </Flex>
    </Flex>
  );
};
