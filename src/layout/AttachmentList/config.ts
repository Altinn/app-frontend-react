import { CG } from 'src/codegen/CG';
import { ComponentCategory } from 'src/layout/common';

export const Config = new CG.component({
  category: ComponentCategory.Presentation,
  rendersWithLabel: false,
  capabilities: {
    renderInTable: false,
    renderInButtonGroup: false,
  },
})
  .addTextResource({
    name: 'title',
    title: 'Title',
    description: 'Title shown above the attachment list',
  })
  .addProperty(
    new CG.prop(
      'dataTypeIds',
      new CG.arr(new CG.str())
        .optional()
        .setTitle('Data type IDs')
        .setDescription('List of data type IDs for the attachment list to show'),
    ),
  )
  .addProperty(
    new CG.prop(
      'includePDF',
      new CG.bool()
        .optional()
        .setTitle('Include PDF?')
        .setDescription('Whether to include the generated PDF summary files in the attachment list'),
    ),
  );
