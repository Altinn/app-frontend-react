import { CG } from 'src/codegen/CG';
import { CompCategory } from 'src/layout/common';
import { NodeDefPlugin } from 'src/utils/layout/plugins/NodeDefPlugin';
import type { ComponentConfig } from 'src/codegen/ComponentConfig';
import type { CompCapabilities } from 'src/codegen/Config';
import type { TypesFromCategory } from 'src/layout/layout';
import type {
  DefPluginChildClaimerProps,
  DefPluginExtraInItem,
  DefPluginState,
  DefPluginStateFactoryProps,
  NodeDefChildrenPlugin,
} from 'src/utils/layout/plugins/NodeDefPlugin';
import type { TraversalRestriction } from 'src/utils/layout/useNodeTraversal';

interface Config<
  Type extends TypesFromCategory<CompCategory.Container>,
  ExternalProp extends string,
  InternalProp extends string,
> {
  componentType: Type;
  settings: Required<Pick<ExternalConfig, 'title' | 'description'>>;
  expectedFromExternal: {
    [key in ExternalProp]: string[];
  };
  extraState: undefined;
  extraInItem: { [key in ExternalProp]: undefined } & { [key in InternalProp]: string[] };
}

interface ExternalConfig {
  componentType?: TypesFromCategory<CompCategory.Container>;
  externalProp?: string;
  internalProp?: string;
  title?: string;
  description?: string;
  onlyWithCapability?: keyof CompCapabilities;
}

const defaultConfig = {
  componentType: 'unknown' as TypesFromCategory<CompCategory.Container>,
  externalProp: 'children' as const,
  internalProp: 'childComponents' as const,
  title: 'Children',
  description: 'List of child component IDs to show inside',
};

type Combined<E extends ExternalConfig> = typeof defaultConfig & E;
type ToInternal<E extends ExternalConfig> = Config<
  Combined<E>['componentType'],
  Combined<E>['externalProp'],
  Combined<E>['internalProp']
>;

export class NonRepeatingChildrenPlugin<E extends ExternalConfig>
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
      import: 'NonRepeatingChildrenPlugin',
      from: 'src/utils/layout/plugins/NonRepeatingChildrenPlugin',
    });
  }

  getKey(): string {
    return ['NonRepeatingChildrenPlugin', this.settings.externalProp].join('/');
  }

  makeConstructorArgs(asGenericArgs = false): string {
    if (!this.component) {
      throw new Error('Component not set, cannot make constructor args for plugin not attached to a component');
    }

    this.settings.componentType = this.component.type as TypesFromCategory<CompCategory.Container>;
    return this.makeConstructorArgsWithoutDefaultSettings(defaultConfig, asGenericArgs);
  }

  addToComponent(component: ComponentConfig): void {
    this.component = component;
    if (component.config.category !== CompCategory.Container) {
      throw new Error('NonRepeatingChildrenPlugin can only be used with container components');
    }
    component.addProperty(
      new CG.prop(
        this.settings.externalProp,
        new CG.arr(new CG.str()).setTitle(this.settings.title).setDescription(this.settings.description),
      ),
    );
  }

  extraNodeGeneratorChildren(): string {
    const GenerateNodeChildren = new CG.import({
      import: 'GenerateNodeChildren',
      from: 'src/utils/layout/generator/LayoutSetGenerator',
    });
    return `<${GenerateNodeChildren} claims={props.childClaims} pluginKey='${this.getKey()}' />`;
  }

  itemFactory({ idMutators, item, layoutMap, getCapabilities }: DefPluginStateFactoryProps<ToInternal<E>>) {
    const raw = (item[this.settings.externalProp] ?? []) as string[];
    const children: string[] = [];
    for (const childId of raw) {
      if (this.settings.onlyWithCapability) {
        const rawLayout = layoutMap[childId];
        if (!rawLayout) {
          continue;
        }
        const capabilities = getCapabilities(rawLayout.type);
        if (!capabilities[this.settings.onlyWithCapability]) {
          // No need to log again, we already do that in claimChildren
          continue;
        }
      }
      const id = idMutators.reduce((id, mutator) => mutator(id), childId);
      children.push(id);
    }

    return {
      [this.settings.externalProp]: undefined,
      [this.settings.internalProp]: children,
    } as DefPluginExtraInItem<ToInternal<E>>;
  }

  claimChildren({ item, claimChild, getProto }: DefPluginChildClaimerProps<ToInternal<E>>): void {
    for (const id of item[this.settings.externalProp].values()) {
      if (this.settings.onlyWithCapability) {
        const proto = getProto(id);
        if (!proto) {
          continue;
        }
        if (!proto.capabilities[this.settings.onlyWithCapability]) {
          window.logWarn(
            `${this.settings.componentType} component included a component '${id}', which ` +
              `is a '${proto.type}' and cannot be rendered in an ${this.settings.componentType}.`,
          );
          continue;
        }
      }
      claimChild(id);
    }
  }

  pickDirectChildren(state: DefPluginState<ToInternal<E>>, restriction?: TraversalRestriction): string[] {
    if (restriction !== undefined) {
      return [];
    }

    return state.item?.[this.settings.internalProp] || [];
  }

  isChildHidden(_state: DefPluginState<ToInternal<E>>, _childId: string): boolean {
    return false;
  }
}
