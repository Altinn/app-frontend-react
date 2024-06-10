import dot from 'dot-object';

import { CG } from 'src/codegen/CG';
import { CompCategory } from 'src/layout/common';
import { NodePathNotFound } from 'src/utils/layout/NodePathNotFound';
import { NodeDefPlugin } from 'src/utils/layout/plugins/NodeDefPlugin';
import { splitDashedKey } from 'src/utils/splitDashedKey';
import type { ComponentConfig } from 'src/codegen/ComponentConfig';
import type { GenerateImportedSymbol } from 'src/codegen/dataTypes/GenerateImportedSymbol';
import type { CompDef, NodeRefInRow } from 'src/layout';
import type { CompTypes } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type {
  DefPluginChildClaimerProps,
  DefPluginExprResolver,
  DefPluginExtraInItem,
  DefPluginState,
  DefPluginStateFactoryProps,
  NodeDefChildrenPlugin,
} from 'src/utils/layout/plugins/NodeDefPlugin';
import type { BaseRow, NodeData } from 'src/utils/layout/types';
import type { TraversalRestriction } from 'src/utils/layout/useNodeTraversal';

export interface RepChildrenRow extends BaseRow {
  items: NodeRefInRow[];
}

interface RowsState<Extras> {
  [uuid: string]: {
    extras: Extras;
    children: {
      [baseId: string]: NodeData;
    };
  } & BaseRow;
}

interface Config<ExternalProp extends string, InternalProp extends string, Extras> {
  componentType: CompTypes;
  settings: Required<Pick<ExternalConfig, 'title' | 'description'>>;
  expectedFromExternal: {
    [key in ExternalProp]: string[];
  };
  extraState: {
    [key in InternalProp]: RowsState<Extras>;
  };
  extraInItem: { [key in ExternalProp]: undefined } & { [key in InternalProp]: (RepChildrenRow & Extras)[] };
}

export interface ExternalConfig {
  dataModelGroupBinding?: string;
  multiPageSupport?: false | string; // Path to property that indicates if multi-page support is enabled
  extraRowState?: unknown;
  externalProp?: string;
  internalProp?: string;
  title?: string;
  description?: string;
}

const defaultConfig = {
  dataModelGroupBinding: 'group' as const,
  multiPageSupport: false as const,
  extraRowState: undefined,
  externalProp: 'children' as const,
  internalProp: 'rows' as const,
  title: 'Children',
  description:
    'List of child component IDs to show inside (will be repeated according to the number of rows in the data model binding)',
};

type FromImport<I> = I extends GenerateImportedSymbol<infer T> ? T : I;
type ConfigOrDefault<C, D> = D & C extends never ? C : D & C;
type Combined<E extends ExternalConfig> = {
  [key in keyof Required<ExternalConfig>]: Exclude<ConfigOrDefault<E[key], (typeof defaultConfig)[key]>, undefined>;
};
type Setting<E extends ExternalConfig, P extends keyof ExternalConfig> = Combined<E>[P];

type ToInternal<E extends ExternalConfig> = Config<
  Setting<E, 'externalProp'>,
  Setting<E, 'internalProp'>,
  FromImport<Setting<E, 'extraRowState'>>
>;
type InternalRowState<E extends ExternalConfig> = RowsState<FromImport<Combined<E>['extraRowState']>>;
type InternalState<E extends ExternalConfig> = { [key in Setting<E, 'internalProp'>]: InternalRowState<E> };

export class RepeatingChildrenPlugin<E extends ExternalConfig>
  extends NodeDefPlugin<ToInternal<E>>
  implements NodeDefChildrenPlugin<ToInternal<E>>
{
  protected settings: Combined<E>;
  protected component: ComponentConfig | undefined;
  constructor(settings: E) {
    super({
      ...defaultConfig,
      ...settings,
    } as Combined<E>);
  }

  makeImport() {
    return new CG.import({
      import: 'RepeatingChildrenPlugin',
      from: 'src/utils/layout/plugins/RepeatingChildrenPlugin',
    });
  }

  getKey(): string {
    return [this.constructor.name, this.settings.externalProp].join('/');
  }

  makeConstructorArgs(asGenericArgs = false): string {
    return super.makeConstructorArgsWithoutDefaultSettings(defaultConfig, asGenericArgs);
  }

  addToComponent(component: ComponentConfig): void {
    this.component = component;
    if (component.config.category !== CompCategory.Container) {
      throw new Error('RepeatingChildrenPlugin can only be used with container components');
    }

    component.addProperty(
      new CG.prop(
        this.settings.externalProp,
        new CG.arr(new CG.str()).setTitle(this.settings.title).setDescription(this.settings.description),
      ),
    );
  }

  extraNodeGeneratorChildren(): string {
    const NodeRepeatingChildren = new CG.import({
      import: 'NodeRepeatingChildren',
      from: 'src/utils/layout/generator/NodeRepeatingChildren',
    });
    const multiPageSupport = this.settings.multiPageSupport === false ? 'false' : `'${this.settings.multiPageSupport}'`;
    return `
      <${NodeRepeatingChildren}
        childIds={props.childIds}
        binding={'${this.settings.dataModelGroupBinding}'}
        internalProp={'${this.settings.internalProp}'}
        externalProp={'${this.settings.externalProp}'}
        multiPageSupport={${multiPageSupport}}
      />`.trim();
  }

  stateFactory(_props: DefPluginStateFactoryProps<ToInternal<E>>) {
    return { [this.settings.internalProp]: {} } as ToInternal<E>['extraState'];
  }

  evalDefaultExpressions({ stateSelector }: DefPluginExprResolver<ToInternal<E>>): DefPluginExtraInItem<ToInternal<E>> {
    const internalRows = stateSelector(
      (state) => (state as InternalState<E>)[this.settings.internalProp],
      [this.settings.internalProp],
    ) as InternalRowState<E>;

    const rows: (RepChildrenRow & FromImport<Combined<E>['extraRowState']>)[] = [];
    for (const row of Object.values(internalRows || {})) {
      rows.push({
        index: row.index,
        uuid: row.uuid,
        items: Object.values(row.children).map((child) => ({
          baseId: child.item?.baseComponentId,
          multiPageIndex: child.item?.multiPageIndex,
          nodeRef: child.item?.id,
        })),
        ...(row.extras && typeof row.extras === 'object' ? row.extras : ({} as any)),
      });
    }
    rows.sort((a, b) => a.index - b.index);

    return {
      [this.settings.externalProp]: undefined,
      [this.settings.internalProp]: rows,
    } as DefPluginExtraInItem<ToInternal<E>>;
  }

  extraMethodsInDef(): string[] {
    const ExprResolver = new CG.import({
      import: 'ExprResolver',
      from: 'src/layout/LayoutComponent',
    });

    return [
      `// You have to implement this method because the component uses the RepeatingChildrenPlugin
      abstract evalExpressionsForRow(props: ${ExprResolver}<'${this.component!.type}'>): unknown;`,
    ];
  }

  claimChildren({ claimChild, item }: DefPluginChildClaimerProps<ToInternal<E>>): void {
    const multiPage =
      this.settings.multiPageSupport !== false && dot.pick(this.settings.multiPageSupport, item) === true;

    for (const id of item[this.settings.externalProp]) {
      if (multiPage) {
        const [, childId] = id.split(':', 2);
        claimChild(childId);
      } else {
        claimChild(id);
      }
    }
  }

  pickDirectChildren(state: DefPluginState<ToInternal<E>>, restriction?: TraversalRestriction): NodeRefInRow[] {
    const out: NodeRefInRow[] = [];

    const rows = state[this.settings.internalProp] as InternalRowState<E>;
    if (!rows) {
      return out;
    }

    for (const row of Object.values(rows)) {
      if (restriction && 'onlyInRowUuid' in restriction && row.uuid !== restriction.onlyInRowUuid) {
        continue;
      }
      if (restriction && 'onlyInRowIndex' in restriction && row.index !== restriction.onlyInRowIndex) {
        continue;
      }

      for (const child of Object.values(row.children)) {
        const item = child.item;
        if (item) {
          out.push({
            baseId: item.baseComponentId ?? item.id,
            multiPageIndex: item.multiPageIndex,
            nodeRef: item.id,
          });
        }
      }
    }

    return out;
  }

  pickChild<C extends CompTypes>(
    state: DefPluginState<ToInternal<E>>,
    childId: string,
    parentPath: string[],
  ): ReturnType<CompDef<C>['stateFactory']> {
    const { baseComponentId, depth } = splitDashedKey(childId);
    const lastIndex = depth[depth.length - 1];
    let child: NodeData<C> | undefined;

    // TODO: Try to include the row ID in the child ID (using new internal node IDs?) so that this lookup is more
    // effective.
    const rows = state[this.settings.internalProp] as InternalRowState<E>;
    for (const row of Object.values(rows)) {
      if (row && row.index === lastIndex && row.children && row.children[baseComponentId]) {
        child = row.children[baseComponentId] as NodeData<C>;
        break;
      }
    }

    if (!child) {
      throw new NodePathNotFound(`Child with id ${childId} not found in /${parentPath.join('/')}`);
    }
    return child;
  }

  addChild(state: DefPluginState<ToInternal<E>>, childNode: LayoutNode, childStore: NodeData): void {
    const row = childNode.row;
    if (!row) {
      throw new Error(`Child node of repeating component missing 'row' property`);
    }
    const rows = state[this.settings.internalProp] as InternalRowState<E>;
    const children = rows[row.uuid]?.children ?? {};
    children[childNode.getBaseId()] = childStore;
    rows[row.uuid] = { ...row, children, extras: rows[row.uuid]?.extras };
  }

  removeChild(state: DefPluginState<ToInternal<E>>, childNode: LayoutNode): void {
    const row = childNode.row;
    if (!row) {
      throw new Error(`Child node of repeating component missing 'row' property`);
    }
    const rows = state[this.settings.internalProp] as InternalRowState<E>;
    if (!rows[row.uuid]) {
      return;
    }

    delete rows[row.uuid].children[childNode.getBaseId()];
  }
}
