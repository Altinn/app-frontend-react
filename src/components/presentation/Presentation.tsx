import React from 'react';
import type { PropsWithChildren } from 'react';

import Grid from '@material-ui/core/Grid';
import cn from 'classnames';

import { LogoColor } from 'src/components/logo/AltinnLogo';
import { AltinnSubstatusPaper } from 'src/components/molecules/AltinnSubstatusPaper';
import { AltinnAppHeader } from 'src/components/organisms/AltinnAppHeader';
import { Header } from 'src/components/presentation/Header';
import { NavBar } from 'src/components/presentation/NavBar';
import classes from 'src/components/presentation/Presentation.module.css';
import { Progress } from 'src/components/presentation/Progress';
import { Footer } from 'src/features/footer/Footer';
import { useLaxInstanceData } from 'src/features/instance/InstanceContext';
import { useLanguage } from 'src/features/language/useLanguage';
import { useCurrentParty } from 'src/features/party/PartiesProvider';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { AltinnAppTheme } from 'src/theme/altinnAppTheme';
import { ProcessTaskType } from 'src/types';
import type { PresentationType } from 'src/types';

export interface IPresentationProvidedProps extends PropsWithChildren {
  header?: React.ReactNode;
  type: ProcessTaskType | PresentationType;
}

export const PresentationComponent = ({ header, type, children }: IPresentationProvidedProps) => {
  const { lang, langAsString } = useLanguage();
  const party = useCurrentParty();
  const instance = useLaxInstanceData();
  const userParty = useAppSelector((state) => state.profile.profile?.party);
  const { expandedWidth } = useAppSelector((state) => state.formLayout.uiConfig);

  const realHeader = header || (type === ProcessTaskType.Archived ? lang('receipt.receipt') : undefined);

  const isProcessStepsArchived = Boolean(type === ProcessTaskType.Archived);
  const backgroundColor = isProcessStepsArchived
    ? AltinnAppTheme.altinnPalette.primary.greenLight
    : AltinnAppTheme.altinnPalette.primary.greyLight;
  document.body.style.background = backgroundColor;

  return (
    <div className={cn(classes.container, { [classes.expanded]: expandedWidth })}>
      <AltinnAppHeader
        party={party}
        userParty={userParty}
        logoColor={LogoColor.blueDarker}
        headerBackgroundColor={backgroundColor}
      />
      <main className={classes.page}>
        {isProcessStepsArchived && instance?.status?.substatus && (
          <AltinnSubstatusPaper
            label={langAsString(instance.status.substatus.label)}
            description={langAsString(instance.status.substatus.description)}
          />
        )}
        <NavBar type={type} />
        <section
          id='main-content'
          className={classes.modal}
        >
          <Header header={realHeader}>
            <ProgressBar type={type} />
          </Header>
          <div className={classes.modalBody}>{children}</div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

function ProgressBar({ type }: { type: ProcessTaskType | PresentationType }) {
  const showProgressSettings = useAppSelector((state) => state.formLayout.uiConfig.showProgress);
  const enabled = type !== ProcessTaskType.Archived && showProgressSettings;

  if (!enabled) {
    return null;
  }

  return (
    <Grid
      item
      aria-live='polite'
    >
      <Progress />
    </Grid>
  );
}
