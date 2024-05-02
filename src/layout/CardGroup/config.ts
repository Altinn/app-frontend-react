import { CG, Variant } from 'src/codegen/CG';
import { CompCategory } from 'src/layout/common';

export const Config = new CG.component({
  category: CompCategory.Container,
  rendersWithLabel: true,
  capabilities: {
    renderInTable: false,
    renderInButtonGroup: false,
    renderInAccordion: true,
    renderInAccordionGroup: false,
    renderInCardGroup: false,
    renderInCards: false,
    renderInCardsMedia: false,
  },
})
  .addProperty(
    new CG.prop(
      'children',
      new CG.arr(new CG.str())
        .setTitle('Children')
        .setDescription('Child component IDs of card-like components to be rendered in this group'),
    ).onlyIn(Variant.External),
  )
  .addProperty(new CG.prop('childComponents', new CG.arr(CG.layoutNode)).onlyIn(Variant.Internal));
