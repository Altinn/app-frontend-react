import dot from 'dot-object';

import { CG } from 'src/codegen/CG';
import { CompCategory } from 'src/layout/common';
import { NodeDefPlugin } from 'src/utils/layout/plugins/NodeDefPlugin';
import type { ComponentConfig } from 'src/codegen/ComponentConfig';
import type { TypesFromCategory } from 'src/layout/layout';
import type { ChildIdMutator } from 'src/utils/layout/generator/GeneratorContext';
import type {
  DefPluginChildClaimerProps,
  DefPluginCompExternal,
  DefPluginState,
  NodeDefChildrenPlugin,
} from 'src/utils/layout/plugins/NodeDefPlugin';

export interface RepChildrenInternalState {
  lastMultiPageIndex?: number;
  rawChildren: string[];
  idMutators: ChildIdMutator[];
}

interface Config<
  T extends TypesFromCategory<CompCategory.Container>,
  ExternalProp extends string,
  InternalProp extends string,
> {
  componentType: T;
  settings: Required<Pick<ExternalConfig, 'title' | 'description'>>;
  expectedFromExternal: {
    [key in ExternalProp]: string[];
  };
  extraInItem: { [key in ExternalProp]: undefined } & {
    [key in InternalProp]: string[];
  } & { internal: RepChildrenInternalState };
}

interface ExternalConfig {
  componentType?: TypesFromCategory<CompCategory.Container>;
  dataModelGroupBinding?: string;
  multiPageSupport?: false | string; // Path to property that indicates if multi-page support is enabled
  externalProp?: string;
  internalProp?: string;
  title?: string;
  description?: string;
}

const defaultConfig = {
  componentType: 'unknown' as TypesFromCategory<CompCategory.Container>,
  dataModelGroupBinding: 'group' as const,
  multiPageSupport: false as const,
  externalProp: 'children' as const,
  internalProp: 'childIds' as const,
  title: 'Children',
  description:
    'List of child component IDs to show inside (will be repeated according to the number of rows in the data model binding)',
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

export class RepeatingChildrenPlugin<E extends ExternalConfig = typeof defaultConfig>
  extends NodeDefPlugin<ToInternal<E>>
  implements NodeDefChildrenPlugin<ToInternal<E>>
{
  public settings: Combined<E>;

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
    return ['RepeatingChildrenPlugin', this.settings.externalProp].join('/');
  }

  makeConstructorArgs(asGenericArgs = false): string {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    return `
      <${NodeRepeatingChildren} claims={props.childClaims} plugin={this.plugins['${this.getKey()}'] as any} />
    `.trim();
  }

  private usesMultiPage(item: DefPluginCompExternal<ToInternal<E>>): boolean {
    return this.settings.multiPageSupport !== false && dot.pick(this.settings.multiPageSupport, item) === true;
  }

  claimChildren({ claimChild, item }: DefPluginChildClaimerProps<ToInternal<E>>): void {
    const multiPage = this.usesMultiPage(item);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const id of (item as any)[this.settings.externalProp]) {
      if (multiPage) {
        if (!/^\d+:[^:]+$/u.test(id)) {
          throw new Error(
            `Ved bruk av multiPage må ID være på formatet 'sideIndeks:komponentId' (f.eks. '0:komponentId'). Referansen '${id}' er ikke gyldig.`,
          );
        }

        const [, childId] = id.split(':', 2);
        claimChild(childId);
      } else {
        claimChild(id);
      }
    }
  }

  pickDirectChildren(_state: DefPluginState<ToInternal<E>>, _restriction?: number | undefined): string[] {
    throw new Error('Method not implemented any longer. Figure out how this can work again.');
  }

  isChildHidden(_state: DefPluginState<ToInternal<E>>, _childId: string): boolean {
    // Repeating children plugins do not have any specific logic here, but beware that
    // the RepeatingGroup component does.
    return false;
  }
}
