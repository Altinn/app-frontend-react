import { CG } from 'src/codegen/CG';
import { ComponentCategory } from 'src/layout/common';

export const Config = new CG.component({
  category: ComponentCategory.Form,
  rendersWithLabel: true,
  capabilities: {
    renderInTable: true,
    renderInButtonGroup: false,
  },
})
  .addDataModelBinding('simple')
  .addProperty(
    new CG.prop(
      'minDate',
      new CG.union(new CG.str(), new CG.const('today'))
        .optional(new CG.const('1900-01-01T12:00:00.000Z'))
        .setTitle('Earliest date')
        .setDescription(
          "Sets the earliest allowed date. Can also use keyword 'today' to disable all past dates dynamically based " +
            'on the current date. Defaults to 1900-01-01T12:00:00.000Z.',
        ),
    ),
  )
  .addProperty(
    new CG.prop(
      'maxDate',
      new CG.union(new CG.str(), new CG.const('today'))
        .optional(new CG.const('2100-01-01T12:00:00.000Z'))
        .setTitle('Latest date')
        .setDescription(
          "Sets the latest allowed date. Can also use keyword 'today' to disable all future dates dynamically based " +
            'on the current date. Defaults to 2100-01-01T12:00:00.000Z.',
        ),
    ),
  )
  .addProperty(
    new CG.prop(
      'timeStamp',
      new CG.bool()
        .optional(CG.true)
        .setTitle('Include time')
        .setDescription(
          'Boolean value indicating if the date time should be stored as a timeStamp. Defaults to true. ' +
            "If true: 'YYYY-MM-DDThh:mm:ss.sssZ', if false 'YYYY-MM-DD';",
        ),
    ),
  )
  .addProperty(
    new CG.prop(
      'format',
      new CG.str()
        .optional(new CG.const('DD.MM.YYYY'))
        .setTitle('Date format')
        .setDescription(
          'Date format used when displaying the date to the user. The user date format from the locale ' +
            'will be prioritized over this setting.',
        )
        .addExample('DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'),
    ),
  );
