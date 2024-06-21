import { CG } from 'src/codegen/CG';
import { CompCategory } from 'src/layout/common';

export const Config = new CG.component({
  category: CompCategory.Presentation,
  rendersWithLabel: false,
  capabilities: {
    renderInTable: true,
    renderInButtonGroup: false,
    renderInAccordion: true,
    renderInAccordionGroup: false,
    renderInCards: true,
    renderInCardsMedia: false,
  },
})
  .addTextResource(
    new CG.trb({
      name: 'title',
      title: 'Title',
      description: 'The title of the value',
    }),
  )
  .addProperty(new CG.prop('value', new CG.arr(new CG.num())))
  .addProperty(new CG.prop('direction', new CG.enum('horizontal', 'vertical').optional({ default: 'horizontal' })))
  .addProperty(new CG.prop('icon', new CG.str().optional().addExample('https://example.com/icon.svg')));
