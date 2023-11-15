import React from 'react';
import type { PropsWithChildren } from 'react';

import { createStrictContext } from 'src/features/contexts/createContext';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { selectAppName, selectAppOwner } from 'src/selectors/language';

const { Provider } = createStrictContext<undefined>({
  name: 'WindowTitle',
});

export function WindowTitleProvider({ children }: PropsWithChildren) {
  const appName = useAppSelector(selectAppName);
  const appOwner = useAppSelector(selectAppOwner);

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
