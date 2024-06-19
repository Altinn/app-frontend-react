import type { NodeRef } from '..';

import { CG } from 'src/codegen/CG';
import { CompCategory } from 'src/layout/common';
import { NodePathNotFound } from 'src/utils/layout/NodePathNotFound';
import { NodeDefPlugin } from 'src/utils/layout/plugins/NodeDefPlugin';
import type { ComponentConfig } from 'src/codegen/ComponentConfig';
import type { CompTypes } from 'src/layout/layout';
import type { TabConfig } from 'src/layout/Tabs/config.generated';
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

export interface TabConfigInternal extends Omit<TabConfig, 'children'> {
  children?: NodeRef[];
}

interface Config<Type extends CompTypes> {
  componentType: Type;
  expectedFromExternal: {
    tabs: TabConfig[];
  };
  extraState: {
    tabsItems: {
      [tabIndex: number]: {
        children: {
          [nodeId: string]: NodeRef;
        };
      };
    };
  };
  extraInItem: {
    tabsInternal: TabConfigInternal[];
  };
}

export class TabsPlugin<Type extends CompTypes>
  extends NodeDefPlugin<Config<Type>>
  implements NodeDefChildrenPlugin<Config<Type>>
{
  protected component: ComponentConfig | undefined;

  makeImport() {
    return new CG.import({
      import: 'TabsPlugin',
      from: 'src/layout/Tabs/TabsPlugin',
    });
  }

  addToComponent(component: ComponentConfig): void {
    this.component = component;
    if (component.config.category !== CompCategory.Container) {
      throw new Error('TabsPlugin can only be used with container components');
    }
  }

  makeGenericArgs(): string {
    return `'${this.component!.type}'`;
  }

  claimChildren({ item, claimChild, getProto }: DefPluginChildClaimerProps<Config<Type>>): void {
    for (const tab of item.tabs || []) {
      for (const child of tab.children || []) {
        const proto = getProto(child);
        if (!proto) {
          continue;
        }
        if (proto.capabilities.renderInTabs === false) {
          window.logWarn(
            `Tabs component included a component '${child}', which ` +
              `is a '${proto.type}' and cannot be rendered as a Tabs child.`,
          );
          continue;
        }
        claimChild(child);
      }
    }
  }

  stateFactory(_props: DefPluginStateFactoryProps<Config<Type>>): Config<Type>['extraState'] {
    return {
      tabsItems: {},
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
    const tabs: TabConfigInternal[] = [];
    for (const externalTab of item.tabs) {
      const { children, ...rest } = externalTab;
      tabs.push({
        ...rest,
        children:
          children?.map((child) => ({
            nodeRef: child,
          })) || [],
      });
    }

    return { tabsInternal: tabs };
  }

  pickDirectChildren(state: DefPluginState<Config<Type>>, _restriction?: TraversalRestriction | undefined): NodeRef[] {
    const refs: NodeRef[] = [];
    for (const tab of Object.values(state.tabsItems)) {
      for (const child of Object.values(tab.children)) {
        refs.push(child);
      }
    }

    return refs;
  }

  pickChild<C extends CompTypes>(
    state: DefPluginState<Config<Type>>,
    childId: string,
    parentPath: string[],
  ): NodeData<C> {
    for (const tab of Object.values(state.tabsItems)) {
      if (tab.children[childId]) {
        return tab.children[childId] as NodeData<C>;
      }
    }

    throw new NodePathNotFound(`Child with id ${childId} not found in /${parentPath.join('/')}`);
  }

  addChild(state: DefPluginState<Config<Type>>, childNode: LayoutNode): Partial<DefPluginState<Config<Type>>> {
    let idx: number | undefined;
    for (const [index, tab] of state.layout.tabs.entries()) {
      if (tab.children?.find((child) => child === childNode.getBaseId())) {
        idx = index;
        break;
      }
    }

    if (idx === undefined) {
      throw new NodePathNotFound(`Child with id ${childNode.getId()} not found in layout`);
    }

    const tabsItems = { ...state.tabsItems };
    if (!tabsItems[idx]) {
      tabsItems[idx] = {
        children: {},
      };
    }

    tabsItems[idx] = {
      ...tabsItems[idx],
      children: {
        ...tabsItems[idx].children,
        [childNode.getId()]: { nodeRef: childNode.getId() },
      },
    };

    return { tabsItems };
  }

  removeChild(state: DefPluginState<Config<Type>>, childNode: LayoutNode): Partial<DefPluginState<Config<Type>>> {
    const tabsItems = { ...state.tabsItems };
    for (const key of Object.keys(tabsItems)) {
      const tab = tabsItems[key];
      if (tab.children[childNode.getId()]) {
        tabsItems[key] = { ...tab, children: { ...tab.children, [childNode.getId()]: undefined } };
        return { tabsItems };
      }
    }

    return state;
  }
}
