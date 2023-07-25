import { CG } from 'src/codegen/CG';
import { ComponentCategory } from 'src/layout/common';

export const Generator = CG.newComponent({
  category: ComponentCategory.Form,
  rendersWithLabel: false,
  capabilities: {
    renderInTable: true,
    renderInButtonGroup: true,
  },
})
  .addTextResource({
    name: 'title',
    title: 'Title',
    description: 'Title (passed on as the "text" property to the component)',
  })
  .addProperty({
    name: 'tagName',
    title: 'Tag name',
    description: 'Web component tag name to use',
    value: CG.str(),
  });
// TODO: Add support for any data model binding
