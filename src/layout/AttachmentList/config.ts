import { CG } from 'src/codegen/CG';
import { ComponentCategory } from 'src/layout/common';

export const Generator = CG.newComponent({
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
  .addProperty({
    name: 'dataTypeIds',
    title: 'Data type IDs',
    description: 'List of data type IDs for the attachment list to show',
    value: CG.arr(CG.str()).optional(),
  })
  .addProperty({
    name: 'includePDF',
    title: 'Include PDF?',
    description: 'Whether to include the generated PDF summary files in the attachment list',
    value: CG.bool().optional(),
  });
