import React from 'react';

import { useQuery } from '@tanstack/react-query';

import classes from 'src/components/logo/AltinnLogo.module.css';
import { useAppQueries } from 'src/core/contexts/AppQueriesProvider';

export interface IAltinnLogoProps {
  color: 'blueDark' | 'blueDarker';
}

export const LogoColorMap = {
  blueDark: '#0062BA',
  blueDarker: '#022F51',
};

function useLogoSvg() {
  const { fetchLogo } = useAppQueries();
  return useQuery({
    queryKey: ['logoSvg'],
    queryFn: () => fetchLogo(),
  });
}

function reColorSvg(svg: string, color: string) {
  return svg.replace(/fill="[^"]"/g, `fill="${color}"`);
}

export const AltinnLogo = ({ color }: IAltinnLogoProps) => {
  const { data } = useLogoSvg();

  if (!data) {
    return <div className={classes.logo} />;
  }

  return (
    <img
      className={classes.logo}
      alt='Altinn logo'
      id='logo'
      src={`data:image/svg+xml;utf8,${encodeURIComponent(reColorSvg(data, LogoColorMap[color]))}`}
    />
  );
};
