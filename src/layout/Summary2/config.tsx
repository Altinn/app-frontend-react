import { CG, Variant } from 'src/codegen/CG';
import { CompCategory } from 'src/layout/common';

export const Config = new CG.component({
  category: CompCategory.Container,
  rendersWithLabel: false,
  capabilities: {
    renderInTable: false,
    renderInButtonGroup: false,
    renderInAccordion: false,
    renderInAccordionGroup: false,
  },
})
  .addProperty(
    new CG.prop(
      'pageId',
      new CG.str()
        .setTitle('Page ID')
        .setDescription('String value indicating which page ID the summary is for.')
        .optional(),
    ),
  )
  .addProperty(
    new CG.prop(
      'children',
      new CG.arr(new CG.str())
        .optional()
        .setTitle('Children')
        .setDescription('Array of component IDs that should be displayed in the summary'),
    ).onlyIn(Variant.External),
  )
  .addProperty(new CG.prop('childComponents', new CG.arr(CG.layoutNode)).onlyIn(Variant.Internal))
  .addProperty(
    new CG.prop(
      'children',
      new CG.arr(new CG.str())
        .optional()
        .setTitle('Children')
        .setDescription('Array of component IDs that should be displayed in the summary'),
    ).onlyIn(Variant.External),
  );
