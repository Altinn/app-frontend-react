import React from 'react';
import type { PropsWithChildren } from 'react';

import cn from 'classnames';

import { LogoColor } from 'src/components/logo/AltinnLogo';
import { AltinnSubstatusPaper } from 'src/components/molecules/AltinnSubstatusPaper';
import { AltinnAppHeader } from 'src/components/organisms/AltinnAppHeader';
import { Header } from 'src/components/presentation/Header';
import { NavBar } from 'src/components/presentation/NavBar';
import classes from 'src/components/presentation/Presentation.module.css';
import { Progress } from 'src/components/presentation/Progress';
import { createContext } from 'src/core/contexts/context';
import { RenderStart } from 'src/core/ui/RenderStart';
import { Footer } from 'src/features/footer/Footer';
import { useUiConfigContext } from 'src/features/form/layout/UiConfigContext';
import { usePageSettings } from 'src/features/form/layoutSettings/LayoutSettingsContext';
import { useLaxInstanceStatus } from 'src/features/instance/InstanceContext';
import { Lang } from 'src/features/language/Lang';
import { useCurrentParty } from 'src/features/party/PartiesProvider';
import { useProfile } from 'src/features/profile/ProfileProvider';
import { AltinnAppTheme } from 'src/theme/altinnAppTheme';
import { ProcessTaskType } from 'src/types';
import type { PresentationType } from 'src/types';

export interface IPresentationProvidedProps extends PropsWithChildren {
  header?: React.ReactNode;
  type: ProcessTaskType | PresentationType;
  renderNavBar?: boolean;
}

export const PresentationComponent = ({ header, type, children, renderNavBar = true }: IPresentationProvidedProps) => {
  const party = useCurrentParty();
  const instanceStatus = useLaxInstanceStatus();
  const userParty = useProfile()?.party;
  const { expandedWidth } = useUiConfigContext();

  const { showProgress } = usePageSettings();
  const isProgressEnabled = type !== ProcessTaskType.Archived && showProgress;
  const showProgressBar = isProgressEnabled && showProgress;

  const realHeader = header || (type === ProcessTaskType.Archived ? <Lang id={'receipt.receipt'} /> : undefined);

  const isProcessStepsArchived = Boolean(type === ProcessTaskType.Archived);
  const backgroundColor = isProcessStepsArchived
    ? AltinnAppTheme.altinnPalette.primary.greenLight
    : AltinnAppTheme.altinnPalette.primary.greyLight;
  document.body.style.background = backgroundColor;

  return (
    <RenderStart>
      <PresentationProvider value={undefined}>
        <div
          data-testid='presentation'
          data-expanded={JSON.stringify(expandedWidth)}
          className={cn(classes.container, { [classes.expanded]: expandedWidth })}
        >
          <AltinnAppHeader
            party={party}
            userParty={userParty}
            logoColor={LogoColor.blueDarker}
            headerBackgroundColor={backgroundColor}
          />
          <main className={classes.page}>
            {isProcessStepsArchived && instanceStatus?.substatus && (
              <AltinnSubstatusPaper
                label={<Lang id={instanceStatus.substatus.label} />}
                description={<Lang id={instanceStatus.substatus.description} />}
              />
            )}
            {renderNavBar && <NavBar type={type} />}
            <section
              id='main-content'
              className={classes.modal}
              tabIndex={-1}
            >
              <Header header={realHeader}>{showProgressBar && <Progress />}</Header>
              <div className={classes.modalBody}>{children}</div>
            </section>
          </main>
          <Footer />
        </div>
      </PresentationProvider>
    </RenderStart>
  );
};

const { Provider: PresentationProvider, useHasProvider } = createContext<undefined>({
  name: 'Presentation',
  required: true,
});

export const useHasPresentation = () => useHasProvider();
