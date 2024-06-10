import { CG } from 'src/codegen/CG';
import { CompCategory } from 'src/layout/common';
import { NodePathNotFound } from 'src/utils/layout/NodePathNotFound';
import { NodeDefPlugin } from 'src/utils/layout/plugins/NodeDefPlugin';
import type { ComponentConfig } from 'src/codegen/ComponentConfig';
import type { CompCapabilities } from 'src/codegen/Config';
import type { NodeRef } from 'src/layout';
import type { CompTypes, TypesFromCategory } from 'src/layout/layout';
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
  extraState: {
    [key in ExternalProp]: { [key: string]: NodeRef };
  };
  extraInItem: { [key in ExternalProp]: undefined } & { [key in InternalProp]: NodeRef[] };
}

export interface ExternalConfig {
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
      componentType: 'unknown' as TypesFromCategory<CompCategory.Container>,
    } as Combined<E>);
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

  makeConstructorArgs(asGenericArgs = false): string {
    if (!this.component) {
      throw new Error('Component not set, cannot make constructor args for plugin not attached to a component');
    }

    this.settings.componentType = this.component.type as any;
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
    const GenerateNodeChildrenWhenReady = new CG.import({
      import: 'GenerateNodeChildrenWhenReady',
      from: 'src/utils/layout/generator/LayoutSetGenerator',
    });
    return `<${GenerateNodeChildrenWhenReady} childIds={props.childIds} />`;
  }

  claimChildren({ item, claimChild, getProto }: DefPluginChildClaimerProps<ToInternal<E>>): void {
    for (const id of item[this.settings.externalProp]) {
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

  stateFactory(_props: DefPluginStateFactoryProps<ToInternal<E>>): ToInternal<E>['extraState'] {
    return {
      [this.settings.externalProp as Combined<E>['externalProp']]: {} as { [key: string]: NodeRef },
    } as ToInternal<E>['extraState'];
  }

  evalDefaultExpressions(props: DefPluginExprResolver<ToInternal<E>>) {
    const nodeRefs: NodeRef[] = props.item[this.settings.externalProp].map((id: string) => ({
      nodeRef: id,
    }));

    return {
      [this.settings.externalProp]: undefined,
      [this.settings.internalProp]: nodeRefs,
    } as ToInternal<E>['extraInItem'];
  }

  pickDirectChildren(state: DefPluginState<ToInternal<E>>, _restriction?: TraversalRestriction): NodeRef[] {
    return state.item?.[this.settings.internalProp] || [];
  }

  pickChild<C extends CompTypes>(state: DefPluginState<ToInternal<E>>, childId: string, parentPath: string[]) {
    const child = state[this.settings.externalProp][childId];
    if (!child) {
      throw new NodePathNotFound(`Child with id ${childId} not found in /${parentPath.join('/')}`);
    }
    return child as NodeData<C>;
  }

  addChild(state: DefPluginState<ToInternal<E>>, childNode: LayoutNode) {
    state[this.settings.externalProp][childNode.getId()] = { nodeRef: childNode.getId() };
  }

  removeChild(state: DefPluginState<ToInternal<E>>, childNode: LayoutNode) {
    delete state[this.settings.externalProp][childNode.getId()];
  }
}
