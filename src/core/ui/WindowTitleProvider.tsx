import React from 'react';
import type { PropsWithChildren } from 'react';

import { createStrictContext } from 'src/core/contexts/context';
import { useAppName, useAppOwner } from 'src/core/texts/appTexts';

const { Provider } = createStrictContext<undefined>({
  name: 'WindowTitle',
});

export function WindowTitleProvider({ children }: PropsWithChildren) {
  const appName = useAppName();
  const appOwner = useAppOwner();

  // Set the title of the app
  React.useEffect(() => {
    if (appName && appOwner) {
      document.title = `${appName} - ${appOwner}`;
    } else if (appName && !appOwner) {
      document.title = appName;
    } else if (!appName && appOwner) {
      document.title = appOwner;
    }
  }, [appOwner, appName]);

  return <Provider value={undefined}>{children}</Provider>;
}
