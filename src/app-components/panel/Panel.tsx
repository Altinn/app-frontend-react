import React from 'react';
import type { JSX, PropsWithChildren } from 'react';

import {
  CheckmarkCircleIcon,
  ExclamationmarkTriangleIcon,
  InformationSquareIcon,
  XMarkOctagonIcon,
} from '@navikt/aksel-icons';
import cn from 'classnames';

import { PANEL_VARIANTS } from 'src/app-components/panel/constants';
import classes from 'src/app-components/panel/Panel.module.css';
import { useIsMobile } from 'src/hooks/useDeviceWidths';

export type PanelVariant = (typeof PANEL_VARIANTS)[keyof typeof PANEL_VARIANTS];

type PanelProps = PropsWithChildren<{
  variant: PanelVariant;
  showIcon?: boolean;
  forceMobileLayout?: boolean;
  title?: JSX.Element;
}>;

type PanelIconProps = {
  isMobileLayout: boolean;
  variant: PanelVariant;
};

function PanelIcon({ isMobileLayout, variant }: PanelIconProps) {
  const fontSize = isMobileLayout ? '2rem' : '3.5rem';

  switch (variant) {
    case PANEL_VARIANTS.Info:
      return (
        <InformationSquareIcon
          title='info'
          fontSize={fontSize}
        />
      );
    case PANEL_VARIANTS.Warning:
      return (
        <ExclamationmarkTriangleIcon
          title='warning'
          fontSize={fontSize}
        />
      );
    case PANEL_VARIANTS.Error:
      return (
        <XMarkOctagonIcon
          title='error'
          fontSize={fontSize}
        />
      );
    case PANEL_VARIANTS.Success:
      return (
        <CheckmarkCircleIcon
          title='success'
          fontSize={fontSize}
        />
      );
  }
}

export const Panel: React.FC<PanelProps> = ({
  variant,
  showIcon = false,
  forceMobileLayout = false,
  title,
  children,
}) => {
  const isMobile = useIsMobile();
  const isMobileLayout = forceMobileLayout || isMobile;

  return (
    <div
      className={cn(classes.panel, {
        [classes.panelMobileLayout]: isMobileLayout,
      })}
    >
      <div
        data-testid='panel-content-wrapper'
        className={cn(classes.panelContentWrapper, classes[`panelContentWrapper_${variant}`])}
      >
        {showIcon && (
          <div
            data-testid='panel-icon-wrapper'
            className={cn(classes.panelIconWrapper, classes[`panelIconWrapper_${variant}`])}
          >
            <PanelIcon
              isMobileLayout={isMobileLayout}
              variant={variant}
            />
          </div>
        )}
        <div className={classes.panelContent}>
          {title && <h2 className={classes.panelHeader}>{title}</h2>}
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
};
