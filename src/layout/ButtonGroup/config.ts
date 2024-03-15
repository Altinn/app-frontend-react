import { CG } from 'src/codegen/CG';
import { CompCategory } from 'src/layout/common';

export const Config = new CG.component({
  category: CompCategory.Container,
  rendersWithLabel: true,
  capabilities: {
    renderInTable: false,
    renderInButtonGroup: false,
    renderInAccordion: false,
    renderInAccordionGroup: false,
  },
})
  .setLayoutNodeType(
    new CG.import({
      import: 'ButtonGroupNode',
      from: 'src/layout/ButtonGroup/ButtonGroupNode',
    }),
  )
  .addProperty(
    new CG.prop(
      'children',
      new CG.arr(new CG.str())
        .setTitle('Children')
        .setDescription('Child component IDs of button-like components to be rendered in this group'),
    ),
  );
