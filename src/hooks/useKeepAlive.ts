import { useCallback, useEffect, useRef } from 'react';

import { httpGet } from 'src/utils/network/networking';
import { getEnvironmentLoginUrl, refreshJwtTokenUrl } from 'src/utils/urls/appUrlHelper';

// 1 minute = 60.000ms
const TEN_MINUTE_IN_MILLISECONDS: number = 60000 * 10;

export const useKeepAlive = (appOidcProvider: string, allowAnonymous: boolean | undefined) => {
  const lastRefreshTokenTimestamp = useRef(0);

  const refreshJwtToken = useCallback(() => {
    const timeNow = Date.now();
    if (timeNow - lastRefreshTokenTimestamp.current > TEN_MINUTE_IN_MILLISECONDS) {
      lastRefreshTokenTimestamp.current = timeNow;
      httpGet(refreshJwtTokenUrl).catch((err) => {
        // Most likely the user has an expired token, so we redirect to the login-page
        try {
          window.location.href = getEnvironmentLoginUrl(appOidcProvider || null);
        } catch (error) {
          console.error(err, error);
        }
      });
    }
  }, [appOidcProvider]);

  useEffect((): (() => void) | undefined => {
    const toggleEventListeners = (eventListener: 'addEventListener' | 'removeEventListener') => {
      const eventsToListenTo = ['mousemove', 'scroll', 'onfocus', 'keydown'];
      eventsToListenTo.forEach((event) => window[eventListener](event, refreshJwtToken));
    };

    if (allowAnonymous === false) {
      toggleEventListeners('addEventListener');
      return () => {
        toggleEventListeners('removeEventListener');
      };
    }
  }, [allowAnonymous, refreshJwtToken]);
};
