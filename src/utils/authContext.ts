import type { IProcessPermissions, IProcessState } from 'src/features/process';
import type { IAuthContext } from 'src/types/shared';

export function buildAuthContext(process: IProcessState | IProcessPermissions | undefined): IAuthContext {
  return {
    read: process?.read ?? true,
    write: process?.write ?? true,
    instantiate: process?.actions?.instantiate ?? true,
    confirm: process?.actions?.confirm ?? true,
    sign: process?.actions?.sign ?? true,
    reject: process?.actions?.reject ?? true,
  };
}
