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
  .addProperty({
    name: 'action',
    title: 'Action',
    description: 'The action to perform when the button is clicked.',
    value: CG.union(CG.const('instantiate'), CG.const('confirm'), CG.const('sign'), CG.const('reject')),
  })
  .addProperty({
    name: 'buttonStyle',
    title: 'Button style',
    description: 'The style/color scheme of the button.',
    value: CG.union(CG.const('primary'), CG.const('secondary')),
  });
