import { CG } from 'src/codegen/CG';
import { ComponentCategory } from 'src/layout/common';

export const Config = new CG.component({
  category: ComponentCategory.Container,
  rendersWithLabel: true,
  capabilities: {
    renderInTable: false,
    renderInButtonGroup: false,
  },
}).addProperty({
  unresolved: new CG.prop(
    'children',
    new CG.arr(new CG.str())
      .setTitle('Children')
      .setDescription('Child component IDs of button-like components to be rendered in this group'),
  ),
  resolved: new CG.prop(
    'childComponents',
    new CG.arr(
      new CG.import({
        import: 'LayoutNode',
        from: 'src/utils/layout/LayoutNode',
      }),
    ),
  ),
});
