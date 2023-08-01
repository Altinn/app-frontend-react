import { CG } from 'src/codegen/CG';
import { ComponentCategory } from 'src/layout/common';
import type { CodeGenerator } from 'src/codegen/CodeGenerator';
import type { ComponentConfig } from 'src/codegen/ComponentConfig';
import type { GenerateProperty } from 'src/codegen/dataTypes/GenerateProperty';

export const Config = new CG.component({
  category: ComponentCategory.Container,
  rendersWithLabel: true,
  capabilities: {
    renderInTable: false,
    renderInButtonGroup: false,
    renderInAccordion: false,
    renderInAccordionGroup: false,
  },
}).addProperty(
  ...generateGridRowsProperty((cellType) => {
    const type = generateGridArray(cellType).setTitle('Rows in Grid').setDescription('The list of rows in this grid');
    return new CG.prop('rows', type);
  }),
);

export function generateGridRowsProperty(
  generateProp: (cellType: CodeGenerator<any>) => GenerateProperty<any>,
): Parameters<ComponentConfig['addProperty']> {
  return [
    generateProp(
      new CG.linked(
        new CG.obj(
          new CG.prop('component', new CG.str().setTitle('Component ID').setDescription('ID of the component')),
        ).exportAs('GridComponentRef'),
        new CG.import({
          import: 'GridComponent',
          from: 'src/layout/Grid/types',
        }),
      ),
    ),
  ];
}

export function generateGridArray(cellType: CodeGenerator<any>) {
  return new CG.arr(
    new CG.obj(
      new CG.prop('header', new CG.bool().optional(false).setTitle('Is header row?')),
      new CG.prop('readOnly', new CG.bool().optional(false).setTitle('Is row read-only?')),
      new CG.prop('columnOptions', CG.common('ITableColumnsProperties').optional()),
      new CG.prop(
        'cells',
        new CG.arr(
          new CG.union(
            cellType,
            CG.null,
            new CG.obj(
              new CG.prop('text', new CG.str()),
              new CG.prop('help', new CG.str().optional()),
              new CG.prop('alignText', CG.common('ITableColumnsAlignText').optional()),
              new CG.prop('textOverflow', CG.common('ITableColumnsTextOverflow').optional()),
            ).exportAs('GridText'),
          )
            .setTitle('Cells in table row')
            .setDescription('The list of cells in this row'),
        ),
      ),
    ),
  );
}
