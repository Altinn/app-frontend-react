import { FooterComponent } from '..';

import { FooterEmail } from 'src/features/footer/components/Email/FooterEmail';
import type { IFooterEmailComponent } from 'src/features/footer/components/Email/types.d';

export class FooterEmailComponent extends FooterComponent<IFooterEmailComponent> {
  protected renderComponent = FooterEmail;
}
