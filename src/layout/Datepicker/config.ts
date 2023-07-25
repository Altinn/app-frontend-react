import { CG } from 'src/codegen/CG';
import { ComponentCategory } from 'src/layout/common';

export const Generator = CG.newComponent({
  category: ComponentCategory.Form,
  rendersWithLabel: true,
  capabilities: {
    renderInTable: true,
    renderInButtonGroup: false,
  },
})
  .addDataModelBinding('simple')
  .addProperty({
    name: 'minDate',
    title: 'Earliest date',
    description:
      "Sets the earliest allowed date. Can also use keyword 'today' to disable all past dates dynamically based on the current date. Defaults to 1900-01-01T12:00:00.000Z.",
    value: CG.union(CG.str(), CG.const('today')).optional(CG.const('1900-01-01T12:00:00.000Z')),
  })
  .addProperty({
    name: 'maxDate',
    title: 'Latest date',
    description:
      "Sets the latest allowed date. Can also use keyword 'today' to disable all future dates dynamically based on the current date. Defaults to 2100-01-01T12:00:00.000Z.",
    value: CG.union(CG.str(), CG.const('today')).optional(CG.const('2100-01-01T12:00:00.000Z')),
  })
  .addProperty({
    name: 'timeStamp',
    title: 'Include time',
    description:
      'Boolean value indicating if the date time should be stored as a timeStamp. Defaults to true. ' +
      "If true: 'YYYY-MM-DDThh:mm:ss.sssZ', if false 'YYYY-MM-DD';",
    value: CG.bool().optional(CG.true()),
  })
  .addProperty({
    name: 'format',
    title: 'Date format',
    description:
      'Long date format used when displaying the date to the user. The user date format from the locale will be prioritized over this setting.',
    examples: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'],
    value: CG.str().optional(CG.const('DD.MM.YYYY')),
  });
