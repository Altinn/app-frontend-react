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
    renderInTabs: true,
  },
  functionality: {
    customExpressions: false,
  },
})
  .extends(CG.common('LabeledComponentProps'))
  .extendTextResources(CG.common('TRBLabel'))
  .addProperty(new CG.prop('title', new CG.str()))
  .addDataModelBinding(CG.common('IDataModelBindingsSimple'))
  .addProperty(
    new CG.prop(
      'columnConfig',
      new CG.arr(
        new CG.obj(
          new CG.prop('header', new CG.str()),
          new CG.prop(
            'accessors',
            new CG.arr(new CG.str())
              .setTitle('Accessors')
              .setDescription('List of fields that should be included in the cell'),
          ),
        ).exportAs('ColumnConfig'),
      ),
    ),
  )
  .addProperty(
    new CG.prop(
      'zebra',
      new CG.bool().setTitle('Size').setDescription('If true, the table will have zebra striping').optional(),
    ),
  )
  .addProperty(
    new CG.prop(
      'enableDelete',
      new CG.bool().setTitle('Enable delete').setDescription('If true, will allow user to delete row').optional(),
    ),
  )
  .addProperty(
    new CG.prop('size', new CG.enum('sm', 'md', 'lg').setTitle('Size').setDescription('Size of table.').optional()),
  )
  .addProperty(
    new CG.prop(
      'excludedChildren',
      new CG.arr(new CG.enum('action', 'md', 'lg'))
        .optional()
        .setTitle('Excluded child components')
        .setDescription("Array of component IDs that should not be shown in a repeating group's summary"),
    ),
  );
