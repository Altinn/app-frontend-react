import { CG } from 'src/codegen/CG';
import { TsVariant } from 'src/codegen/CodeGeneratorContext';
import { ComponentCategory } from 'src/layout/common';

export const Config = new CG.component({
  category: ComponentCategory.Container,
  rendersWithLabel: true,
  capabilities: {
    renderInTable: false,
    renderInButtonGroup: false,
    renderInAccordion: false,
    renderInAccordionGroup: false,
  },
})
  .addProperty(
    new CG.prop(
      'children',
      new CG.arr(new CG.str())
        .setTitle('Children')
        .setDescription('Child component IDs of button-like components to be rendered in this group'),
    ).onlyIn(TsVariant.Unresolved),
  )
  .addProperty(
    new CG.prop(
      'childComponents',
      new CG.arr(
        new CG.import({
          import: 'LayoutNode',
          from: 'src/utils/layout/LayoutNode',
        }),
      ),
    ).onlyIn(TsVariant.Resolved),
  );
