import { CG } from 'src/codegen/CG';
import { CompCategory } from 'src/layout/common';

export const Config = new CG.component({
  category: CompCategory.Form,
  capabilities: {
    renderInTable: false,
    renderInButtonGroup: false,
    renderInAccordion: false,
    renderInAccordionGroup: false,
    renderInCards: false,
    renderInCardsMedia: false,
  },
})
  .addProperty(
    new CG.prop(
      'centerLocation',
      new CG.obj(new CG.prop('latitude', new CG.num()), new CG.prop('longitude', new CG.num()))
        .optional()
        .exportAs('GeometryMapLocation')
        .setTitle('Center location')
        .setDescription('Center location of the geometry-map'),
    ),
  )
  .addProperty(new CG.prop('zoom', new CG.num().optional()))
  .addDataModelBinding(
    new CG.obj(
      new CG.prop('array', new CG.str().optional()),
      new CG.prop('wkt', new CG.str()),
      new CG.prop('label', new CG.str()),
    ).exportAs('IDataModelBindingsForGeometryMap'),
  );
