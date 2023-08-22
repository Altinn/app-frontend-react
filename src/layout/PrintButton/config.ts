import { CG } from 'src/codegen/CG';
import { ComponentCategory } from 'src/layout/common';

export const Config = new CG.component({
  category: ComponentCategory.Action,
  rendersWithLabel: false,
  capabilities: {
    renderInTable: true,
    renderInButtonGroup: true,
    renderInAccordion: false,
    renderInAccordionGroup: false,
  },
}).addTextResource(
  new CG.trb({
    name: 'title',
    title: 'Title',
    description: 'The title/text on the button',
  }),
);
