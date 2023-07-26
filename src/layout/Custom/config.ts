import { CG } from 'src/codegen/CG';
import { ComponentCategory } from 'src/layout/common';

export const Config = new CG.component({
  category: ComponentCategory.Form,
  rendersWithLabel: false,
  capabilities: {
    renderInTable: true,
    renderInButtonGroup: true,
  },
})
  .addTextResource(
    new CG.trb({
      name: 'title',
      title: 'Title',
      description: 'Title (passed on as the "text" property to the component)',
    }),
  )
  .addProperty(
    new CG.prop('tagName', new CG.str().setTitle('Tag name').setDescription('Web component tag name to use')),
  );
// PRIORITY: Add support for any data model binding
