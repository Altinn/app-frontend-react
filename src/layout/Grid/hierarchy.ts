import { ComponentHierarchyGenerator } from 'src/utils/layout/HierarchyGenerator';
import type { ChildFactory, HierarchyContext, UnprocessedItem } from 'src/utils/layout/HierarchyGenerator';

export class GridHierarchyGenerator extends ComponentHierarchyGenerator<'Grid'> {
  stage1(item: UnprocessedItem<'Grid'>): void {
    for (const row of item.rows) {
      for (const cell of row.cells) {
        if (cell && 'component' in cell) {
          this.generator.claimChild({
            childId: cell.component,
            parentId: item.id,
          });
        }
      }
    }
  }

  stage2(ctx: HierarchyContext): ChildFactory<'Grid'> {
    return (props) => {
      const me = this.generator.makeNode(props);

      for (const row of me.item.rows) {
        for (const cell of row.cells) {
          if (cell && 'component' in cell) {
            const childId = cell.component as string;
            const node = this.generator.newChild({
              ctx,
              childId,
              parent: me,
            });

            delete cell['component'];
            cell['node'] = node;
          }
        }
      }

      return me;
    };
  }
}
