const LOCAL_TEST = /local\.altinn\.cloud/;
const STUDIO_DEV = /dev\.altinn\.studio/;
const STUDIO_PROD = /altinn\.studio/;
const STUDIO_LOCAL = /studio\.localhost/;
const TT02 = /\S+\.apps\.tt02\.altinn\.no/;

interface isDevProps {
  includeTT02?: boolean;
}
export function useIsDev(options?: isDevProps): boolean {
  const host = window.location.host;
  return Boolean(
    LOCAL_TEST.test(host) ||
      STUDIO_DEV.test(host) ||
      STUDIO_PROD.test(host) ||
      STUDIO_LOCAL.test(host) ||
      (options?.includeTT02 && TT02.test(host)),
  );
}
