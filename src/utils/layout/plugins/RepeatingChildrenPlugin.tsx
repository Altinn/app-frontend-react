import dot from 'dot-object';

import { CG } from 'src/codegen/CG';
import { CompCategory } from 'src/layout/common';
import { NodeDefPlugin } from 'src/utils/layout/plugins/NodeDefPlugin';
import type { ComponentConfig } from 'src/codegen/ComponentConfig';
import type { GenerateImportedSymbol } from 'src/codegen/dataTypes/GenerateImportedSymbol';
import type { NodeRefInRow } from 'src/layout';
import type { CompInternal, TypesFromCategory } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type {
  DefPluginChildClaimerProps,
  DefPluginExprResolver,
  DefPluginExtraInItem,
  DefPluginState,
  DefPluginStateFactoryProps,
  NodeDefChildrenPlugin,
} from 'src/utils/layout/plugins/NodeDefPlugin';
import type { BaseRow } from 'src/utils/layout/types';
import type { TraversalRestriction } from 'src/utils/layout/useNodeTraversal';

export interface RepChildrenRow extends BaseRow {
  items: NodeRefInRow[];
}

interface Config<
  T extends TypesFromCategory<CompCategory.Container>,
  ExternalProp extends string,
  InternalProp extends string,
  Extras,
> {
  componentType: T;
  settings: Required<Pick<ExternalConfig, 'title' | 'description'>>;
  expectedFromExternal: {
    [key in ExternalProp]: string[];
  };
  extraInItem: { [key in ExternalProp]: undefined } & { [key in InternalProp]: (RepChildrenRow & Extras)[] };
}

export interface ExternalConfig {
  componentType?: TypesFromCategory<CompCategory.Container>;
  dataModelGroupBinding?: string;
  multiPageSupport?: false | string; // Path to property that indicates if multi-page support is enabled
  extraRowState?: unknown;
  externalProp?: string;
  internalProp?: string;
  title?: string;
  description?: string;
}

const defaultConfig = {
  componentType: 'unknown' as TypesFromCategory<CompCategory.Container>,
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
  Setting<E, 'componentType'>,
  Setting<E, 'externalProp'>,
  Setting<E, 'internalProp'>,
  FromImport<Setting<E, 'extraRowState'>>
>;

type Row<E extends ExternalConfig> = RepChildrenRow & E['extraRowState'];

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
    this.settings.componentType = this.component!.type as any;
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
    return {
      item: {
        [this.settings.internalProp]: [],
      } as CompInternal<ToInternal<E>['componentType']>,
    };
  }

  evalDefaultExpressions(_props: DefPluginExprResolver<ToInternal<E>>): DefPluginExtraInItem<ToInternal<E>> {
    // Row state isn't set here, it's constructed when adding/removing rows. Expressions in rows are resolved
    // and added by ResolveRowExpressions.
    return {
      [this.settings.externalProp]: undefined,
    } as unknown as DefPluginExtraInItem<ToInternal<E>>;
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

    for (const id of (item as any)[this.settings.externalProp]) {
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

    const rows = (state.item as any)[this.settings.internalProp] as Row<E>[];
    if (!rows) {
      return out;
    }

    for (const row of rows) {
      if (restriction && 'onlyInRowUuid' in restriction && row.uuid !== restriction.onlyInRowUuid) {
        continue;
      }
      if (restriction && 'onlyInRowIndex' in restriction && row.index !== restriction.onlyInRowIndex) {
        continue;
      }

      for (const child of row.items) {
        out.push(child);
      }
    }

    return out;
  }

  addChild(state: DefPluginState<ToInternal<E>>, childNode: LayoutNode): Partial<DefPluginState<ToInternal<E>>> {
    const row = childNode.row;
    if (!row) {
      throw new Error(`Child node of repeating component missing 'row' property`);
    }
    const rows = [...(state.item as any)[this.settings.internalProp]] as Row<E>[];
    const existingRowIndex = rows.findIndex((r) => r.uuid === row.uuid);
    const items = [...(rows[existingRowIndex]?.items || [])];
    items.push({
      nodeRef: childNode.getId(),
      baseId: childNode.getBaseId(),
      multiPageIndex: childNode.getMultiPageIndex(),
    });

    if (existingRowIndex === -1) {
      rows.push({ ...(rows[existingRowIndex] || {}), ...row, items });
    } else {
      rows[existingRowIndex] = { ...(rows[existingRowIndex] || {}), ...row, items };
    }

    return { item: { ...state.item, [this.settings.internalProp]: rows } } as Partial<DefPluginState<ToInternal<E>>>;
  }

  removeChild(_state: DefPluginState<ToInternal<E>>, _childNode: LayoutNode): Partial<DefPluginState<ToInternal<E>>> {
    // There is no need to remove the reference to the child node, as the child node is removed from the state when
    // the whole row is removed.
    return _state;
  }
}
