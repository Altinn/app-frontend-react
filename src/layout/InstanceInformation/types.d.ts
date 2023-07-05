import type { ILayoutCompBase } from 'src/layout/layout';

type ValidTexts = undefined;
export interface ILayoutCompInstanceInformation extends ILayoutCompBase<'InstanceInformation', undefined, ValidTexts> {
  elements?: {
    dateSent?: boolean;
    sender?: boolean;
    receiver?: boolean;
    referenceNumber?: boolean;
  };
}
