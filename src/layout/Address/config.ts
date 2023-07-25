import { CG } from 'src/codegen/CG';
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
  .addProperty({
    name: 'simplified',
    title: 'Simplified',
    description: 'Whether to use the simplified address input or not',
    value: CG.bool().optional(CG.const(true)),
  });
