import { CG } from 'src/codegen/CG';
import { CompCategory } from 'src/layout/common';
import { NodeStatePlugin } from 'src/utils/layout/NodeStatePlugin';
import type { ComponentConfig } from 'src/codegen/ComponentConfig';
import type { NodeRef } from 'src/layout';
import type { CompTypes } from 'src/layout/layout';
import type { ChildLookupRestriction } from 'src/utils/layout/HierarchyGenerator';
import type { ItemStore } from 'src/utils/layout/itemState';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type {
  NodeStateChildrenPlugin,
  PluginChildClaimerProps,
  PluginExprResolver,
  PluginState,
  PluginStateFactoryProps,
} from 'src/utils/layout/NodeStatePlugin';

interface Config<Type extends CompTypes, ExternalProp extends string, InternalProp extends string> {
  componentType: Type;
  settings: {
    property: ExternalProp;
  };
  expectedFromExternal: {
    [key in ExternalProp]: string[];
  };
  extraState: {
    [key in ExternalProp]: { [key: string]: ItemStore };
  };
  extraInItem: { [key in ExternalProp]: undefined } & { [key in InternalProp]: NodeRef[] };
}

export interface ExternalConfig {
  externalProp?: string;
  internalProp?: string;
  title?: string;
  description?: string;
}

const defaultConfig = {
  externalProp: 'children' as const,
  internalProp: 'childComponents' as const,
  title: 'Children',
  description: 'List of child component IDs to show inside',
};

type Combined<E extends ExternalConfig> = typeof defaultConfig & E;
type ToInternal<E extends ExternalConfig> = Config<CompTypes, Combined<E>['externalProp'], Combined<E>['internalProp']>;

export class NonRepeatingChildrenPlugin<E extends ExternalConfig>
  extends NodeStatePlugin<ToInternal<E>>
  implements NodeStateChildrenPlugin<ToInternal<E>>
{
  protected settings: Combined<E>;
  constructor(settings: E) {
    super();
    this.settings = { ...defaultConfig, ...settings };
  }

  makeImport() {
    return new CG.import({
      import: 'NonRepeatingChildrenPlugin',
      from: 'src/utils/layout/plugins/NonRepeatingChildrenPlugin',
    });
  }

  getKey(): string {
    return [this.constructor.name, this.settings.externalProp].join('/');
  }

  makeConstructorArguments(): string {
    const nonDefaultSettings = Object.keys(this.settings)
      .filter((key) => this.settings[key] !== defaultConfig[key])
      .reduce((acc, key) => {
        acc[key] = this.settings[key];
        return acc;
      }, {} as ExternalConfig);
    return JSON.stringify(nonDefaultSettings);
  }

  addToComponent(component: ComponentConfig): void {
    if (component.config.category !== CompCategory.Container) {
      throw new Error('NonRepeatingChildrenPlugin can only be used with container components');
    }
    component.addProperty(
      new CG.prop(
        this.settings.externalProp,
        new CG.arr(new CG.str())
          .setTitle(this.settings.title ?? 'Children')
          .setDescription(this.settings.description ?? 'List of child component IDs to show inside'),
      ),
    );
  }

  claimChildren({ item, claimChild }: PluginChildClaimerProps<ToInternal<E>>): void {
    for (const id of item[this.settings.externalProp]) {
      claimChild(id);
    }
  }

  stateFactory(_props: PluginStateFactoryProps<ToInternal<E>>) {
    return {
      [this.settings.externalProp as Combined<E>['externalProp']]: {} as { [key: string]: ItemStore },
    };
  }

  evalDefaultExpressions(props: PluginExprResolver<ToInternal<E>>) {
    const nodeRefs: NodeRef[] = Object.keys(props.state?.[this.settings.externalProp] || {}).map((id) => ({
      nodeRef: id,
    }));

    return {
      [this.settings.externalProp]: undefined,
      [this.settings.internalProp]: nodeRefs,
    } as ToInternal<E>['extraInItem'];
  }

  pickDirectChildren(state: PluginState<ToInternal<E>>, _restriction?: ChildLookupRestriction) {
    return state.item?.[this.settings.internalProp] || [];
  }

  pickChild<C extends CompTypes>(state: PluginState<ToInternal<E>>, childId: string, parentPath: string[]) {
    const child = state[this.settings.externalProp][childId];
    if (!child) {
      throw new Error(`Child with id ${childId} not found in /${parentPath.join('/')}`);
    }
    return child as ItemStore<C>;
  }

  addChild(state: PluginState<ToInternal<E>>, childNode: LayoutNode, childStore: ItemStore) {
    state[this.settings.externalProp][childNode.getId()] = childStore;
  }

  removeChild(state: PluginState<ToInternal<E>>, childNode: LayoutNode) {
    delete state[this.settings.externalProp][childNode.getId()];
  }
}
