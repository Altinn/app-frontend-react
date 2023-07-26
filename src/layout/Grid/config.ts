import { CG } from 'src/codegen/CG';
import { ComponentCategory } from 'src/layout/common';
import type { CodeGenerator } from 'src/codegen/CodeGenerator';
import type { GenerateProperty } from 'src/codegen/dataTypes/GenerateProperty';

export const Config = new CG.component({
  category: ComponentCategory.Container,
  rendersWithLabel: true,
  capabilities: {
    renderInTable: false,
    renderInButtonGroup: false,
  },
}).addProperty({
  unresolved: generateRows(
    new CG.import({
      symbol: 'GridComponentRef',
      importFrom: 'src/layout/Grid/types',
    }),
  ),
  resolved: generateRows(
    new CG.import({
      symbol: 'GridComponent',
      importFrom: 'src/layout/Grid/types',
    }),
  ),
});

function generateRows(cellType: CodeGenerator<any>): GenerateProperty<any> {
  const type = new CG.arr(
    new CG.obj({
      inline: true,
      properties: [
        new CG.prop('header', new CG.bool().optional(false).setTitle('Is header row?')),
        new CG.prop('readOnly', new CG.bool().optional(false).setTitle('Is row read-only?')),
        new CG.prop(
          'columnOptions',
          new CG.known('ITableColumnProperties')
            .optional()
            .setTitle('Column options')
            .setDescription('Options for the row/column')
            .addExample({
              width: 'auto',
              alignText: 'left',
              textOverflow: {
                lineWrap: true,
                maxHeight: 2,
              },
            }),
        ),
        new CG.prop(
          'cells',
          new CG.arr(
            new CG.union(
              cellType,
              CG.null,
              new CG.import({
                symbol: 'GridText',
                importFrom: 'src/layout/Grid/types',
              }),
            )
              .setTitle('Cells in table row')
              .setDescription('The list of cells in this row'),
          ),
        ),
      ],
    }),
  )
    .setTitle('Rows in Grid')
    .setDescription('The list of rows in this grid');

  return new CG.prop('rows', type);
}
