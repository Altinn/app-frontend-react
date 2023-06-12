import React from 'react';
import type { ReactNode } from 'react';

import { createTheme, ThemeProvider } from '@material-ui/core';

import { useLanguage } from 'src/hooks/useLanguage';
import { rightToLeftISOLanguageCodes } from 'src/language/languages';
import { AltinnAppTheme } from 'src/theme/altinnAppTheme';

type ThemeWrapperProps = {
  children?: ReactNode;
};

export const ThemeWrapper = ({ children }: ThemeWrapperProps) => {
  const { selectedLanguage } = useLanguage();
  const isRtl = rightToLeftISOLanguageCodes.includes(selectedLanguage);
  const direction = isRtl ? 'rtl' : 'ltr';
  document.documentElement.lang = selectedLanguage;
  document.documentElement.dir = direction;

  return (
    <ThemeProvider
      theme={createTheme({
        ...AltinnAppTheme,
        direction,
      })}
    >
      <div className={isRtl ? 'language-dir-rtl' : ''}>{children}</div>
    </ThemeProvider>
  );
};
