import { useEffect } from 'react';

import { useRefreshJwtTokenQuery } from 'src/hooks/queries/useRefreshJwtTokenQuery';

const ONE_MINUTE_IN_MILLISECONDS = 60000;
const TEN_MINUTE_IN_MILLISECONDS = ONE_MINUTE_IN_MILLISECONDS * 10;

export const useKeepAlive = (appOidcProvider: string, allowAnonymous: boolean | undefined) => {
  const refetchJwtTokenQueryOptions = {
    enabled: allowAnonymous === false, // Only refresh token at page load if allowAnonymous === false
    refetchOnWindowFocus: true,
  };
  const { refetch: getNewAccessToken } = useRefreshJwtTokenQuery(appOidcProvider, { ...refetchJwtTokenQueryOptions });

  useEffect(() => {
    if (allowAnonymous === false) {
      const interval = setInterval(() => {
        getNewAccessToken();
      }, TEN_MINUTE_IN_MILLISECONDS);

      return () => clearInterval(interval);
    }
  }, [allowAnonymous, getNewAccessToken]);
};
