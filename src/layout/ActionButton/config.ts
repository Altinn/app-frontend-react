import { CG } from 'src/codegen/CG';
import { ComponentCategory } from 'src/layout/common';

export const Config = new CG.component({
  category: ComponentCategory.Action,
  rendersWithLabel: false,
  capabilities: {
    renderInTable: true,
    renderInButtonGroup: true,
  },
})
  .addTextResource(
    new CG.trb({
      name: 'title',
      title: 'Button title/text',
      description: 'The text to display on the button.',
    }),
  )
  .addProperty(
    new CG.prop(
      'action',
      new CG.union(new CG.const('instantiate'), new CG.const('confirm'), new CG.const('sign'), new CG.const('reject'))
        .setTitle('Action')
        .setDescription('The action to perform when the button is clicked.'),
    ),
  )
  .addProperty(
    new CG.prop(
      'buttonStyle',
      new CG.union(new CG.const('primary'), new CG.const('secondary'))
        .setTitle('Button style')
        .setDescription('The style/color scheme of the button.'),
    ),
  );
