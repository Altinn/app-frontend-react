import { BaseLayoutNode } from 'src/utils/layout/LayoutNode';
import type { CompInternal, HierarchyDataSources, ParentNode } from 'src/layout/layout';
import type { IsHiddenOptions } from 'src/utils/layout/LayoutNode';
import type { LayoutPage } from 'src/utils/layout/LayoutPage';

export class RepGroupNode extends BaseLayoutNode<'RepeatingGroup'> {
  constructor(
    item: CompInternal<'RepeatingGroup'>,
    parent: ParentNode,
    top: LayoutPage,
    dataSources: HierarchyDataSources,
    rowIndex?: number,
    rowId?: string,
  ) {
    super(item, parent, top, dataSources, rowIndex, rowId);
  }

  protected isDirectChildHidden(_directChild: BaseLayoutNode, _options: IsHiddenOptions): boolean {
    // TODO: This was copied from BaseLayoutNode, but should be adapted to check if a direct child (in one of the rows)
    // should be hidden implicitly.

    // if (this.parent instanceof BaseLayoutNode && typeof this.rowIndex === 'number') {
    //   const isHiddenRow = this.parent.minimalItem.rows[this.rowIndex]?.groupExpressions?.hiddenRow;
    //   if (isHiddenRow) {
    //     this.hiddenCache[cacheKey] = true;
    //     return true;
    //   }
    //
    //   const myBaseId = this.minimalItem.baseComponentId || this.minimalItem.id;
    //   const groupMode = this.parent.minimalItem.edit?.mode;
    //   const tableColSetup = this.parent.minimalItem.tableColumns && this.parent.minimalItem.tableColumns[myBaseId];
    //
    //   // This specific configuration hides the component fully, without having set hidden=true on the component itself.
    //   // It's most likely done by mistake, but we still need to respect it when checking if the component is hidden,
    //   // because it doesn't make sense to validate a component that is hidden in the UI and the
    //   // user cannot interact with.
    //   let hiddenImplicitly =
    //     tableColSetup?.showInExpandedEdit === false && !tableColSetup?.editInTable && groupMode !== 'onlyTable';
    //
    //   if (groupMode === 'onlyTable' && tableColSetup?.editInTable === false) {
    //     // This is also a way to hide a component implicitly
    //     hiddenImplicitly = true;
    //   }
    //
    //   if (hiddenImplicitly) {
    //     return true;
    //   }
    // }

    return false;
  }
}
