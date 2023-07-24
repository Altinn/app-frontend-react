import { CG } from 'src/codegen';
import { ComponentCategory } from 'src/layout/common';

export const Generator = CG.newComponent({
  category: ComponentCategory.Form,
  rendersWithLabel: false,
  capabilities: {
    renderInTable: false,
    renderInButtonGroup: false,
  },
})
  .addDataModelBinding(
    CG.import({
      symbol: 'IDataModelBindingsForAddress',
      importFrom: 'src/layout/Address/types',
    }),
  )
  .addProperty('simplified', CG.bool().optional());
