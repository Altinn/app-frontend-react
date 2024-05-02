import dot from 'dot-object';

import { CG } from 'src/codegen/CG';
import { CompCategory } from 'src/layout/common';
import { splitDashedKey } from 'src/utils/formLayout';
import { NodePathNotFound } from 'src/utils/layout/NodePathNotFound';
import { NodeDefPlugin } from 'src/utils/layout/plugins/NodeDefPlugin';
import type { ComponentConfig } from 'src/codegen/ComponentConfig';
import type { CompDef, NodeRef } from 'src/layout';
import type { CompTypes } from 'src/layout/layout';
import type { ChildLookupRestriction } from 'src/utils/layout/HierarchyGenerator';
import type { BaseRow, ItemStore } from 'src/utils/layout/itemState';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type {
  DefPluginChildClaimerProps,
  DefPluginExprResolver,
  DefPluginState,
  DefPluginStateFactoryProps,
  NodeDefChildrenPlugin,
} from 'src/utils/layout/plugins/NodeDefPlugin';

interface OutputRow extends BaseRow {
  children: NodeRef[];
}

interface RowsState {
  [uuid: string]: {
    children: {
      [baseId: string]: ItemStore;
    };
  } & BaseRow;
}

interface Config<ExternalProp extends string, InternalProp extends string> {
  componentType: CompTypes;
  settings: Required<Pick<ExternalConfig, 'title' | 'description'>>;
  expectedFromExternal: {
    [key in ExternalProp]: string[];
  };
  extraState: {
    [key in InternalProp]: RowsState;
  };
  extraInItem: { [key in ExternalProp]: undefined } & { [key in InternalProp]: OutputRow[] };
}

export interface ExternalConfig {
  dataModelGroupBinding?: string;
  multiPageSupport?: false | string; // Path to property that indicates if multi page support is enabled
  externalProp?: string;
  internalProp?: string;
  title?: string;
  description?: string;
}

const defaultConfig = {
  dataModelGroupBinding: 'group' as const,
  multiPageSupport: false,
  externalProp: 'children' as const,
  internalProp: 'rows' as const,
  title: 'Children',
  description:
    'List of child component IDs to show inside (will be repeated according to the number of rows in the data model binding)',
};

type Combined<E extends ExternalConfig> = typeof defaultConfig & E;
type ToInternal<E extends ExternalConfig> = Config<Combined<E>['externalProp'], Combined<E>['internalProp']>;

const tmpEmptyArray: never[] = [];

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
      from: 'src/utils/layout/NodeRepeatingChildren',
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

  evalDefaultExpressions(_props: DefPluginExprResolver<ToInternal<E>>) {
    // const rowsFromState = state[this.settings.internalProp as Combined<E>['internalProp']];
    // const children = item[this.settings.externalProp] as string[];
    // const rows: Row[] = rowsFromState.map((row) => ({
    //   ...row,
    //   children: children.map((id) => ({ nodeRef: `${id}-${row.index}` })),
    // }));

    return {
      [this.settings.externalProp]: undefined,
      [this.settings.internalProp]: tmpEmptyArray,
    } as ToInternal<E>['extraInItem'];
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

  pickDirectChildren(state: DefPluginState<ToInternal<E>>, restriction?: ChildLookupRestriction): NodeRef[] {
    const out: NodeRef[] = [];

    const rows = state[this.settings.internalProp] as RowsState;
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
        out.push({ nodeRef: child.item.id });
      }
    }

    return out;
  }

  pickChild<C extends CompTypes>(
    state: DefPluginState<ToInternal<E>>,
    childId: string,
    parentPath: string[],
  ): ReturnType<CompDef<C>['stateFactory']> {
    const { baseComponentId } = splitDashedKey(childId);
    let child: ItemStore<C> | undefined;

    // TODO: Try to include the row ID in the child ID (using new internal node IDs?) so that this lookup is more
    // effective.
    const rows = state[this.settings.internalProp] as RowsState;
    for (const row of Object.values(rows)) {
      if (row.children[baseComponentId]) {
        child = row.children[baseComponentId] as ItemStore<C>;
        if (child?.item.id === childId) {
          break;
        }
        child = undefined;
      }
    }

    if (!child) {
      throw new NodePathNotFound(`Child with id ${childId} not found in /${parentPath.join('/')}`);
    }
    return child;
  }

  addChild(state: DefPluginState<ToInternal<E>>, childNode: LayoutNode, childStore: ItemStore): void {
    const row = childNode.row;
    if (!row) {
      throw new Error(`Child node of repeating component missing 'row' property`);
    }
    const rows = state[this.settings.internalProp] as RowsState;
    if (!rows[row.uuid]) {
      rows[row.uuid] = { ...row, children: {} };
    }

    rows[row.uuid].children[childNode.getBaseId()] = childStore;
  }

  removeChild(state: DefPluginState<ToInternal<E>>, childNode: LayoutNode): void {
    const row = childNode.row;
    if (!row) {
      throw new Error(`Child node of repeating component missing 'row' property`);
    }
    const rows = state[this.settings.internalProp] as RowsState;
    if (!rows[row.uuid]) {
      return;
    }

    delete rows[row.uuid].children[childNode.getBaseId()];
  }
}
