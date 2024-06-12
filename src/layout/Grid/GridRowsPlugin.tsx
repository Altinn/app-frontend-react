import type { NodeRef } from '..';

import { CG } from 'src/codegen/CG';
import { CompCategory } from 'src/layout/common';
import { NodePathNotFound } from 'src/utils/layout/NodePathNotFound';
import { isNodeRef } from 'src/utils/layout/nodeRef';
import { NodeDefPlugin } from 'src/utils/layout/plugins/NodeDefPlugin';
import type { ComponentConfig } from 'src/codegen/ComponentConfig';
import type { GridRows } from 'src/layout/common.generated';
import type { GridCellInternal, GridRowsInternal } from 'src/layout/Grid/types';
import type { CompTypes } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type {
  DefPluginChildClaimerProps,
  DefPluginExprResolver,
  DefPluginState,
  DefPluginStateFactoryProps,
  NodeDefChildrenPlugin,
} from 'src/utils/layout/plugins/NodeDefPlugin';
import type { NodeData } from 'src/utils/layout/types';
import type { TraversalRestriction } from 'src/utils/layout/useNodeTraversal';

interface Config<Type extends CompTypes> {
  componentType: Type;
  expectedFromExternal: {
    rows: GridRows;
  };
  extraState: {
    gridItems: {
      [nodeId: string]: NodeRef;
    };
  };
  extraInItem: {
    rows: GridRowsInternal;
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
    for (const row of item.rows || []) {
      for (const cell of row.cells) {
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
          claimChild(cell.component);
        }
      }
    }
  }

  stateFactory(_props: DefPluginStateFactoryProps<Config<Type>>): Config<Type>['extraState'] {
    return {
      gridItems: {},
    };
  }

  extraNodeGeneratorChildren(): string {
    const GenerateNodeChildrenWhenReady = new CG.import({
      import: 'GenerateNodeChildrenWhenReady',
      from: 'src/utils/layout/generator/LayoutSetGenerator',
    });
    return `<${GenerateNodeChildrenWhenReady} childIds={props.childIds} />`;
  }

  evalDefaultExpressions({ item }: DefPluginExprResolver<Config<Type>>): Config<Type>['extraInItem'] {
    const rows: GridRowsInternal = [];
    const externalRows = item?.rows || [];
    for (const rowIdx in externalRows) {
      rows.push({
        ...externalRows[rowIdx],
        cells: externalRows[rowIdx].cells.map((cell) => {
          if (cell && 'component' in cell && cell.component) {
            const { component, ...rest } = cell;
            return {
              nodeRef: component,
              ...rest,
            };
          }
          return cell;
        }) as GridCellInternal[],
      });
    }

    return { rows };
  }

  pickDirectChildren(state: DefPluginState<Config<Type>>, _restriction?: TraversalRestriction | undefined): NodeRef[] {
    const refs: NodeRef[] = [];
    for (const row of state.item?.rows || []) {
      for (const cell of row.cells) {
        if (isNodeRef(cell)) {
          refs.push(cell);
        }
      }
    }

    return refs;
  }

  pickChild<C extends CompTypes>(
    state: DefPluginState<Config<Type>>,
    childId: string,
    parentPath: string[],
  ): NodeData<C> {
    const child = state.gridItems[childId];
    if (!child) {
      throw new NodePathNotFound(`Child with id ${childId} not found in /${parentPath.join('/')}`);
    }
    return child as NodeData<C>;
  }

  addChild(state: DefPluginState<Config<Type>>, childNode: LayoutNode): Partial<DefPluginState<Config<Type>>> {
    const gridItems = { ...state.gridItems };
    gridItems[childNode.getId()] = { nodeRef: childNode.getId() };

    return { gridItems };
  }

  removeChild(state: DefPluginState<Config<Type>>, childNode: LayoutNode): void {
    delete state.gridItems[childNode.getId()];
  }
}
