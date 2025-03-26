import { isDev, isLocalTest } from 'src/utils/isDev';

export function getDomain() {
  if (isLocalTest()) {
    return '.local.altinn.cloud';
  }

  if (isDev()) {
    return '.tt02.altinn.no';
  }

  return '.altinn.no';
}

export function getCookieString(name: string, value: string | number | undefined) {
  const domain = getDomain();

  return `${name}=${value}; Path=/; Domain=${domain};` + `${isLocalTest() ? '' : ' SameSite=None; Secure;'}`;
}

export function setCookie({ name, value }: { name: string; value: string | number | undefined }) {
  document.cookie = getCookieString(name, value);
}

export function getCookieValue(name: string): string | null {
  return (
    document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${name}=`))
      ?.split('=')[1] ?? null
  );
}
