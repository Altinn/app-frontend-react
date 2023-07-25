import { CG } from 'src/codegen/CG';
import { ComponentCategory } from 'src/layout/common';

export const Generator = CG.newComponent({
  category: ComponentCategory.Container,
  rendersWithLabel: true,
  capabilities: {
    renderInTable: false,
    renderInButtonGroup: false,
  },
}).addProperty({
  unresolved: {
    name: 'children',
    title: 'Children',
    description: 'Child component IDs of button-like components to be rendered in this group',
    value: CG.arr(CG.str()),
  },
  resolved: {
    name: 'childComponents',
    value: CG.arr(CG.known('LayoutNode')),
  },
});
