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
      new CG.enum('instantiate', 'confirm', 'sign', 'reject')
        .setTitle('Action')
        .setDescription('The action to perform when the button is clicked.'),
    ),
  )
  .addProperty(
    new CG.prop(
      'buttonStyle',
      new CG.enum('primary', 'secondary')
        .setTitle('Button style')
        .setDescription('The style/color scheme of the button.'),
    ),
  );
