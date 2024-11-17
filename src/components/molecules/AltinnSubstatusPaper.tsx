import React from 'react';

import { Typography } from '@material-ui/core';

import { Flex } from 'src/components/Flex';
import { AltinnInformationPaper } from 'src/components/molecules/AltinnInformationPaper';

export interface IInformationPaperProps {
  label: React.ReactNode;
  description: React.ReactNode;
}

export function AltinnSubstatusPaper({ label, description }: IInformationPaperProps) {
  return (
    <AltinnInformationPaper>
      <Flex
        container
        direction='column'
      >
        <Typography
          id='substatus-label'
          style={{
            fontSize: '1.5rem',
            marginBottom: description ? '0.5rem' : '',
          }}
        >
          {label}
        </Typography>
        <Typography
          id='substatus-description'
          style={{ fontSize: '1.125rem' }}
        >
          {description}
        </Typography>
      </Flex>
    </AltinnInformationPaper>
  );
}
