import { CG } from 'src/codegen/CG';
import { ComponentCategory } from 'src/layout/common';

export const Generator = CG.newComponent({
  category: ComponentCategory.Container,
  rendersWithLabel: true,
  capabilities: {
    renderInTable: false,
    renderInButtonGroup: false,
  },
});
