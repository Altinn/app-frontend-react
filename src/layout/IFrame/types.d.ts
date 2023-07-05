import type { ILayoutCompBase } from 'src/layout/layout';

type ValidTexts = 'title';
export type ILayoutCompIFrame = ILayoutCompBase<'IFrame', undefined, ValidTexts> & {
  sandbox?: ISandboxProperties;
};

export type SupportedSandboxProperties = 'allowPopups' | 'allowPopupsToEscapeSandbox';

export type ISandboxProperties = {
  [K in SupportedSandboxProperties]?: boolean;
};
