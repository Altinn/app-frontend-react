import { CG } from 'src/codegen/CG';
import { CompCategory } from 'src/layout/common';
import { NodeDefPlugin } from 'src/utils/layout/plugins/NodeDefPlugin';
import type { ComponentConfig } from 'src/codegen/ComponentConfig';
import type { GridRows } from 'src/layout/common.generated';
import type { GridCellNode, GridRowsInternal } from 'src/layout/Grid/types';
import type { CompTypes } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type {
  DefPluginChildClaimerProps,
  DefPluginState,
  NodeDefChildrenPlugin,
} from 'src/utils/layout/plugins/NodeDefPlugin';
import type { TraversalRestriction } from 'src/utils/layout/useNodeTraversal';

interface ClaimMetadata {
  rowIdx: number;
  cellIdx: number;
}

interface Config<Type extends CompTypes> {
  componentType: Type;
  expectedFromExternal: {
    rows: GridRows;
  };
  childClaimMetadata: ClaimMetadata;
  extraState: undefined;
  extraInItem: {
    rows: undefined;
    rowsInternal: GridRowsInternal;
  };
}

export class GridRowsPlugin<Type extends CompTypes>
  extends NodeDefPlugin<Config<Type>>
  implements NodeDefChildrenPlugin<Config<Type>>
{
  protected component: ComponentConfig | undefined;

  makeImport() {
    return new CG.import({
      import: 'GridRowsPlugin',
      from: 'src/layout/Grid/GridRowsPlugin',
    });
  }

  addToComponent(component: ComponentConfig): void {
    this.component = component;
    if (component.config.category !== CompCategory.Container) {
      throw new Error('GridRowsPlugin can only be used with container components');
    }
  }

  makeGenericArgs(): string {
    return `'${this.component!.type}'`;
  }

  claimChildren({ item, claimChild, getProto }: DefPluginChildClaimerProps<Config<Type>>): void {
    for (const [rowIdx, row] of item.rows.entries()) {
      for (const [cellIdx, cell] of row.cells.entries()) {
        if (cell && 'component' in cell && cell.component) {
          const proto = getProto(cell.component);
          if (!proto) {
            continue;
          }
          if (!proto.capabilities.renderInTable) {
            window.logWarn(
              `Grid-like component included a component '${cell.component}', which ` +
                `is a '${proto.type}' and cannot be rendered in a table.`,
            );
            continue;
          }
          claimChild(cell.component, { rowIdx, cellIdx });
        }
      }
    }
  }

  extraNodeGeneratorChildren(): string {
    const GenerateNodeChildrenWhenReady = new CG.import({
      import: 'GenerateNodeChildrenWhenReady',
      from: 'src/utils/layout/generator/LayoutSetGenerator',
    });
    return `<${GenerateNodeChildrenWhenReady} claims={props.childClaims} />`;
  }

  pickDirectChildren(
    state: DefPluginState<Config<Type>>,
    _restriction?: TraversalRestriction | undefined,
  ): LayoutNode[] {
    const out: LayoutNode[] = [];
    for (const row of state.item?.rowsInternal || []) {
      for (const cell of row.cells) {
        if (cell && 'node' in cell && cell.node) {
          out.push(cell.node);
        }
      }
    }

    return out;
  }

  addChild(
    state: DefPluginState<Config<Type>>,
    node: LayoutNode,
    metaData: ClaimMetadata,
  ): Partial<DefPluginState<Config<Type>>> {
    const rowsInternal = [...(state.item?.rowsInternal ?? [])];
    const row = rowsInternal[metaData.rowIdx];
    const cells = [...(row.cells ?? [])];
    const overwriteLayout: any = { component: undefined };
    cells[metaData.cellIdx] = { ...cells[metaData.cellIdx], ...overwriteLayout, node } as GridCellNode;
    rowsInternal[metaData.rowIdx] = { ...row, cells };
    return { item: { ...state.item, rowsInternal } } as Partial<DefPluginState<Config<Type>>>;
  }
}
