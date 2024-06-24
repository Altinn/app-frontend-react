import { CG } from 'src/codegen/CG';
import { CompCategory } from 'src/layout/common';
import { NodeDefPlugin } from 'src/utils/layout/plugins/NodeDefPlugin';
import type { ComponentConfig } from 'src/codegen/ComponentConfig';
import type { GridRows } from 'src/layout/common.generated';
import type { GridCellNode, GridRowsInternal } from 'src/layout/Grid/types';
import type { CompTypes, TypesFromCategory } from 'src/layout/layout';
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

interface ExternalConfig {
  componentType?: TypesFromCategory<CompCategory.Container>;
  externalProp?: string;
  internalProp?: string;
  optional?: boolean;
}

interface Config<Type extends CompTypes, ExternalProp extends string, InternalProp extends string> {
  componentType: Type;
  expectedFromExternal: {
    [key in ExternalProp]?: GridRows;
  };
  childClaimMetadata: ClaimMetadata;
  extraState: undefined;
  extraInItem: {
    [key in ExternalProp]: undefined;
  } & {
    [key in InternalProp]: GridRowsInternal;
  };
}

const defaultConfig = {
  componentType: 'unknown' as TypesFromCategory<CompCategory.Container>,
  externalProp: 'rows' as const,
  internalProp: 'rowsInternal' as const,
  optional: false as const,
};

type ConfigOrDefault<C, D> = D & C extends never ? C : D & C;
type Combined<E extends ExternalConfig> = {
  [key in keyof Required<ExternalConfig>]: Exclude<ConfigOrDefault<E[key], (typeof defaultConfig)[key]>, undefined>;
};
type Setting<E extends ExternalConfig, P extends keyof ExternalConfig> = Combined<E>[P];

type ToInternal<E extends ExternalConfig> = Config<
  Setting<E, 'componentType'>,
  Setting<E, 'externalProp'>,
  Setting<E, 'internalProp'>
>;

export class GridRowsPlugin<E extends ExternalConfig>
  extends NodeDefPlugin<ToInternal<E>>
  implements NodeDefChildrenPlugin<ToInternal<E>>
{
  protected settings: Combined<E>;
  protected component: ComponentConfig | undefined;

  constructor(settings?: E) {
    super({
      ...defaultConfig,
      ...settings,
    } as Combined<E>);
  }

  makeImport() {
    return new CG.import({
      import: 'GridRowsPlugin',
      from: 'src/layout/Grid/GridRowsPlugin',
    });
  }

  getKey(): string {
    return [this.constructor.name, this.settings.externalProp].join('/');
  }

  makeConstructorArgs(asGenericArgs = false): string {
    this.settings.componentType = this.component!.type as any;
    return super.makeConstructorArgsWithoutDefaultSettings(defaultConfig, asGenericArgs);
  }

  addToComponent(component: ComponentConfig): void {
    this.component = component;
    if (component.config.category !== CompCategory.Container) {
      throw new Error('GridRowsPlugin can only be used with container components');
    }

    const prop = CG.common('GridRows');
    if (this.settings.optional) {
      prop.optional();
    }

    component.addProperty(new CG.prop(this.settings.externalProp, prop));
  }

  claimChildren({ item, claimChild, getProto }: DefPluginChildClaimerProps<ToInternal<E>>): void {
    const rows = (item as any)[this.settings.externalProp] as GridRows | undefined;
    if (!rows) {
      return;
    }

    for (const [rowIdx, row] of rows.entries()) {
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
    return `<${GenerateNodeChildrenWhenReady} claims={props.childClaims} pluginKey='${this.getKey()}' />`;
  }

  pickDirectChildren(
    state: DefPluginState<ToInternal<E>>,
    _restriction?: TraversalRestriction | undefined,
  ): LayoutNode[] {
    const out: LayoutNode[] = [];
    const rows = (state.item?.[this.settings.externalProp] || []) as GridRowsInternal;
    for (const row of rows) {
      for (const cell of row.cells) {
        if (cell && 'node' in cell && cell.node) {
          out.push(cell.node);
        }
      }
    }

    return out;
  }

  addChild(
    state: DefPluginState<ToInternal<E>>,
    node: LayoutNode,
    metaData: ClaimMetadata,
  ): Partial<DefPluginState<ToInternal<E>>> {
    const rowsInternal = [...(state.item?.[this.settings.internalProp] ?? [])] as GridRowsInternal;
    const row = rowsInternal[metaData.rowIdx] ?? { cells: [] };
    const cells = [...(row.cells ?? [])];
    const overwriteLayout: any = { component: undefined };
    cells[metaData.cellIdx] = { ...cells[metaData.cellIdx], ...overwriteLayout, node } as GridCellNode;
    rowsInternal[metaData.rowIdx] = { ...row, cells };

    return {
      item: {
        ...state.item,
        [this.settings.externalProp]: undefined,
        [this.settings.internalProp]: rowsInternal,
      },
    } as Partial<DefPluginState<ToInternal<E>>>;
  }
}
