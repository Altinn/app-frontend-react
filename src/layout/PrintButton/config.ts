import { CG } from 'src/codegen/CG';
import { LabelRendering } from 'src/codegen/ComponentConfig';
import { CompCategory } from 'src/layout/common';

export const Config = new CG.component({
  category: CompCategory.Action,
  rendersWithLabel: LabelRendering.Off,
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
