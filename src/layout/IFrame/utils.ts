import type { ISandboxProperties } from 'src/layout/IFrame/config.generated';

const defaultSandboxProperties = ['allow-same-origin'];

const sandboxPropertyMap: { [K in keyof ISandboxProperties]: string } = {
  allowPopups: 'allow-popups',
  allowPopupsToEscapeSandbox: 'allow-popups-to-escape-sandbox',
};

export const getSandboxProperties = (sandbox: ISandboxProperties | undefined): string => {
  if (!sandbox) {
    return defaultSandboxProperties.join(' ');
  }

  return defaultSandboxProperties
    .concat(
      Object.entries(sandbox)
        .filter(([, value]) => value)
        .map(([key]) => sandboxPropertyMap[key]),
    )
    .join(' ');
};

export const filterObject = <T>(obj: Record<string, T>, fn: (obj: T) => boolean): Record<string, T> =>
  Object.keys(obj).reduce((acc, key) => ({ ...acc, ...(fn(obj[key]) ? { [key]: obj[key] } : {}) }), {});
