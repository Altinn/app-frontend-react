import { CG } from 'src/codegen/CG';
import { ComponentCategory } from 'src/layout/common';

export const Config = new CG.component({
  category: ComponentCategory.Form,
  rendersWithLabel: false,
  capabilities: {
    renderInTable: false,
    renderInButtonGroup: false,
  },
})
  .addDataModelBinding(
    new CG.import({
      symbol: 'IDataModelBindingsForAddress',
      importFrom: 'src/layout/Address/types',
    }),
  )
  .addProperty(
    new CG.prop(
      'simplified',
      new CG.bool()
        .optional(true)
        .setTitle('Simplified')
        .setDescription('Whether to use the simplified address input or not'),
    ),
  );
