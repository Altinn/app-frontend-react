import { FooterComponent } from '..';

import { FooterLink } from 'src/features/footer/components/Link/FooterLink';
import type { IFooterLinkComponent } from 'src/features/footer/components/Link/types.d';

export class FooterLinkComponent extends FooterComponent<IFooterLinkComponent> {
  protected renderComponent = FooterLink;
}
