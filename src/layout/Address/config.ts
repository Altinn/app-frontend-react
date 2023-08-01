import { CG } from 'src/codegen/CG';
import { ComponentCategory } from 'src/layout/common';

export const Config = new CG.component({
  category: ComponentCategory.Form,
  rendersWithLabel: false,
  capabilities: {
    renderInTable: false,
    renderInButtonGroup: false,
    renderInAccordion: false,
    renderInAccordionGroup: false,
  },
})
  .addDataModelBinding(
    new CG.obj(
      new CG.prop('address', new CG.str()),
      new CG.prop('zipCode', new CG.str()),
      new CG.prop('postPlace', new CG.str()),
      new CG.prop('careOf', new CG.str().optional()),
      new CG.prop('houseNumber', new CG.str().optional()),
    ).exportAs('IDataModelBindingsForAddress'),
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
