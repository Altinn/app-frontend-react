export function getDomain() {
  if (process.env.NODE_ENV === 'production') {
    return window.location.origin.includes('tt02') ? '.tt02.altinn.no' : '.altinn.no';
  }

  return '.local.altinn.cloud';
}

export function getCookieString(name: string, value: string | number | undefined) {
  const domain = getDomain();

  return (
    `${name}=${value}; Path=/; Domain=${domain} SameSite=None;` +
    `${process.env.NODE_ENV === 'production' ? ' Secure;' : ''}`
  );
}

export function setCookie({ name, value }: { name: string; value: string | number | undefined }) {
  console.log('Setting altinn partyId cookie', value);
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
