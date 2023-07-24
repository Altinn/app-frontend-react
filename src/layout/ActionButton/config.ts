import { CG } from 'src/codegen';
import { ComponentCategory } from 'src/layout/common';

export const Generator = CG.newComponent({
  category: ComponentCategory.Action,
  rendersWithLabel: false,
  capabilities: {
    renderInTable: true,
    renderInButtonGroup: true,
  },
})
  .addTextResource({
    name: 'title',
    title: 'Button title/text',
    description: 'The text to display on the button.',
  })
  .addProperty('action', CG.union(CG.const('instantiate'), CG.const('confirm'), CG.const('sign'), CG.const('reject')))
  .addProperty('buttonStyle', CG.union(CG.const('primary'), CG.const('secondary')));
