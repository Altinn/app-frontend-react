import { FooterComponent } from '..';

import { FooterText } from 'src/features/footer/components/Text/FooterText';
import type { IFooterTextComponent } from 'src/features/footer/components/Text/types.d';

export class FooterTextComponent extends FooterComponent<IFooterTextComponent> {
  protected renderComponent = FooterText;
}
