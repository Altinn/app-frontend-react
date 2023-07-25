import { CG } from 'src/codegen/CG';
import { ComponentCategory } from 'src/layout/common';

export const Generator = CG.newComponent({
  category: ComponentCategory.Form,
  rendersWithLabel: true,
  capabilities: {
    renderInTable: true,
    renderInButtonGroup: false,
  },
});
