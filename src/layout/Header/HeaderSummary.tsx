import * as React from 'react';

import { Grid } from '@material-ui/core';

import { HeaderSize } from 'src/layout/Header/HeaderComponent';
import type { ILayoutCompHeader } from 'src/layout/Header/types';

export interface IHeaderSummary {
  id: string;
  label: JSX.Element | JSX.Element[] | null | undefined;
  component: ILayoutCompHeader;
}

export function HeaderSummary({ id, label, component }: IHeaderSummary) {
  return (
    <Grid
      item
      xs={12}
      data-testid={'header-summary'}
    >
      <HeaderSize
        id={id}
        size={component.size}
        text={label}
      />
    </Grid>
  );
}
