import type { ILayoutCompBase } from 'src/layout/layout';

export type ILayoutCompIFrame = ILayoutCompBase<'IFrame'> & {
  sandbox?: ISandboxProperties;
};

export interface ISandboxProperties {
  allowPopups?: boolean;
  allowPopupsToEscapeSandbox?: boolean;
}
