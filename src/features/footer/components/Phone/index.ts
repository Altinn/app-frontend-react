import { FooterComponent } from '..';

import { FooterPhone } from 'src/features/footer/components/Phone/FooterPhone';
import type { IFooterPhoneComponent } from 'src/features/footer/components/Phone/types.d';

export class FooterPhoneComponent extends FooterComponent<IFooterPhoneComponent> {
  protected renderComponent = FooterPhone;
}
