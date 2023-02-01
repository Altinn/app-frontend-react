import React from 'react';

import { Grid } from '@material-ui/core';

import { useAppSelector } from 'src/common/hooks';
import css from 'src/features/footer/Footer.module.css';

const Footer = () => {
  const language = useAppSelector((state) => state.language.language);

  if (language === null) {
    return null;
  }

  return (
    <footer className={css['footer']}>
      <Grid
        container={true}
        spacing={2}
        alignItems='center'
        justifyContent='center'
      ></Grid>
    </footer>
  );
};

export default Footer;
