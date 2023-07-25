import { CG } from 'src/codegen/CG';
import { ComponentCategory } from 'src/layout/common';
import type { CodeGenerator } from 'src/codegen/CodeGenerator';
import type { AddProperty } from 'src/codegen/dataTypes/GenerateObject';

export const Generator = CG.newComponent({
  category: ComponentCategory.Container,
  rendersWithLabel: true,
  capabilities: {
    renderInTable: false,
    renderInButtonGroup: false,
  },
}).addProperty({
  unresolved: generateRows(
    CG.import({
      symbol: 'GridComponentRef',
      importFrom: 'src/layout/Grid/types',
    }),
  ),
  resolved: generateRows(
    CG.import({
      symbol: 'GridComponent',
      importFrom: 'src/layout/Grid/types',
    }),
  ),
});

function generateRows(cellType: CodeGenerator<any>): AddProperty {
  return {
    name: 'rows',
    title: 'Rows in Grid',
    description: 'The list of rows in this grid',
    value: CG.arr(
      CG.obj({
        inline: true,
        properties: [
          {
            name: 'header',
            title: 'Is header row?',
            value: CG.bool().optional(CG.false()),
          },
          {
            name: 'readOnly',
            title: 'Is row read-only?',
            value: CG.bool().optional(CG.false()),
          },
          {
            name: 'columnOptions',
            title: 'Column options',
            description: 'Options for the row/column',
            examples: [
              {
                width: 'auto',
              },
            ],
            value: CG.known('ITableColumnProperties').optional(),
          },
          {
            name: 'cells',
            title: 'Cells in table row',
            description: 'The list of cells in this row',
            value: CG.arr(
              CG.union(
                cellType,
                CG.null(),
                CG.import({
                  symbol: 'GridText',
                  importFrom: 'src/layout/Grid/types',
                }),
              ),
            ),
          },
        ],
      }),
    ),
  };
}
