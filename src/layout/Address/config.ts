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
      import: 'IDataModelBindingsForAddress',
      from: 'src/layout/Address/types',
      jsonSchema: {
        type: 'object',
        properties: {
          address: { type: 'string' },
          zipCode: { type: 'string' },
          postPlace: { type: 'string' },
          careOf: { type: 'string' },
          houseNumber: { type: 'string' },
        },
        required: ['address', 'zipCode', 'postPlace'],
        additionalProperties: false,
      },
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
