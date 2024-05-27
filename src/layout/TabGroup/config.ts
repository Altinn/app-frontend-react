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
    renderInTab: false,
  },
})
  .addTextResource(
    new CG.trb({
      name: 'ariaLabel',
      title: 'Aria Label',
      description: 'The aria label for the tabs',
    }),
  )
  .addProperty(
    new CG.prop(
      'children',
      new CG.arr(new CG.str())
        .setTitle('Children')
        .setDescription(
          'List of component IDs that should be displayed in the TabGroup (limited to just Tab components)',
        ),
    ).onlyIn(Variant.External),
  )
  .addProperty(new CG.prop('childComponents', new CG.arr(CG.layoutNode)).onlyIn(Variant.Internal))
  .addProperty(new CG.prop('size', new CG.enum('small', 'medium', 'large').optional()))
  .addProperty(new CG.prop('defaultTab', new CG.str().optional()));
